// app/api/casino/callback/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateTurnover } from '@/lib/turnover-tracker';

// ==================== CONNECTION POOLING ====================
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ['error'],
    transactionOptions: {
      maxWait: 5000,
      timeout: 10000,
    },
  });
  
  // Apply SQLite optimizations
  Promise.resolve().then(async () => {
    try {
      await globalForPrisma.prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL');
      await globalForPrisma.prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL');
      await globalForPrisma.prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000');
    } catch (e) {}
  });
}

const prisma = globalForPrisma.prisma;

// ==================== BET TRACKER ====================
class BetTracker {
  constructor() {
    this.activeBets = new Map();
    this.processedRounds = new Set();
    this.BET_TIMEOUT = 300000;
    this.CACHE_CLEANUP = 60000;
    
    setInterval(() => this.cleanup(), this.CACHE_CLEANUP);
  }
  
  trackBet(gameRound, userId, betAmount) {
    this.activeBets.set(gameRound, {
      userId,
      betAmount,
      timestamp: Date.now()
    });
  }
  
  removeBet(gameRound) {
    this.activeBets.delete(gameRound);
    this.processedRounds.add(gameRound);
  }
  
  isProcessed(gameRound) {
    return this.processedRounds.has(gameRound);
  }
  
  // CRITICAL FIX: Exclude current round from pending check
  hasPreviousBet(userId, currentGameRound) {
    for (const [round, bet] of this.activeBets.entries()) {
      if (bet.userId === userId && round !== currentGameRound) {
        return { round, betAmount: bet.betAmount };
      }
    }
    return null;
  }
  
  cleanup() {
    const now = Date.now();
    for (const [round, bet] of this.activeBets.entries()) {
      if (now - bet.timestamp > this.BET_TIMEOUT) {
        this.activeBets.delete(round);
      }
    }
    if (this.processedRounds.size > 1000) {
      const array = Array.from(this.processedRounds);
      const toRemove = array.slice(0, array.length - 1000);
      toRemove.forEach(round => this.processedRounds.delete(round));
    }
  }
  
  getStats() {
    return {
      activeBets: this.activeBets.size,
      processedRounds: this.processedRounds.size
    };
  }
}

const betTracker = new BetTracker();

// ==================== SIMPLE QUEUE ====================
class SimpleQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.MAX_CONCURRENT = 1; // Single file = single thread
  }
  
  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      await new Promise(r => setTimeout(r, 10));
    }
    
    this.processing = false;
  }
}

const callbackQueue = new SimpleQueue();

// ==================== MAIN HANDLER ====================
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const url = new URL(request.url);
    const matchId = url.searchParams.get('matchId') || '';
    const body = await request.json().catch(() => ({}));
    
    const memberAccount = String(body.member_account || '1000');
    const betAmount = parseFloat(body.bet_amount) || 0;
    const winAmount = parseFloat(body.win_amount) || 0;
    const gameRound = String(body.game_round || '');
    const casinoId = parseInt(memberAccount) || 0;
    
    if (!gameRound) {
      return NextResponse.json({ credit_amount: 0, timestamp: Date.now() }, { status: 400 });
    }
    
    // Only cache crash callbacks
    if (betTracker.isProcessed(gameRound) && betAmount === 0 && winAmount === 0) {
      const user = await prisma.user.findFirst({ where: { casinoId }, select: { balance: true } });
      return NextResponse.json({
        credit_amount: user ? parseFloat((user.balance / 100).toFixed(2)) : 0,
        timestamp: Date.now(),
        cached: true
      });
    }
    
    // Process in queue
    const result = await callbackQueue.add(async () => {
      return await processCallback({ matchId, memberAccount, betAmount, winAmount, gameRound, casinoId });
    });
    
    console.log(`✅ ${Date.now() - startTime}ms:`, { casinoId, gameRound, newBalance: result.newBalance });
    
    return NextResponse.json({
      credit_amount: parseFloat((result.newBalance / 100).toFixed(2)),
      timestamp: Date.now(),
      balance_paisa: result.newBalance
    });
    
  } catch (error) {
    console.error('🔥', error.message);
    try {
      const body = await request.json().catch(() => ({}));
      const user = await prisma.user.findFirst({ where: { casinoId: parseInt(body.member_account) || 0 }, select: { balance: true } });
      return NextResponse.json({ credit_amount: user ? parseFloat((user.balance / 100).toFixed(2)) : 0, timestamp: Date.now() });
    } catch {
      return NextResponse.json({ credit_amount: 0, timestamp: Date.now() });
    }
  }
}

// ==================== PROCESSING ====================
async function processCallback({ matchId, memberAccount, betAmount, winAmount, gameRound, casinoId }) {
  const user = await prisma.user.findFirst({
    where: { casinoId },
    select: { id: true, balance: true, isBanned: true }
  });
  
  if (!user) throw new Error(`User not found: ${casinoId}`);
  if (user.isBanned) throw new Error(`Banned user: ${user.id}`);
  
  const type = determineCallbackType(betAmount, winAmount);
  
  // CRITICAL: Only check for PREVIOUS bets on NEW bets
  if (type === 'BET_PLACED') {
    const previousBet = betTracker.hasPreviousBet(user.id, gameRound);
    if (previousBet) {
      console.log(`🎯 Auto-loss for previous round ${previousBet.round}`);
      // Fire and forget - NO AWAIT
      setTimeout(() => {
        handleAutoLoss(user.id, previousBet.round, previousBet.betAmount).catch(e => {});
      }, 0);
    }
  }
  
  console.log(`📥 [${type}]:`, { casinoId, betAmount, winAmount, gameRound, userId: user.id });
  
  let newBalance = user.balance;
  
  switch(type) {
    case 'BET_PLACED':
      newBalance = await handleBetPlaced(user.id, gameRound, betAmount, user.balance, matchId);
      betTracker.trackBet(gameRound, user.id, betAmount);
      break;
    case 'GAME_WIN':
      newBalance = await handleGameWin(user.id, gameRound, winAmount, user.balance, matchId);
      betTracker.removeBet(gameRound);
      break;
    case 'GAME_CRASH':
      newBalance = await handleGameCrash(user.id, gameRound, user.balance);
      betTracker.removeBet(gameRound);
      break;
    case 'REGULAR_RESULT':
      newBalance = await handleRegularResult(user.id, gameRound, betAmount, winAmount, user.balance, matchId);
      break;
  }
  
  return { newBalance };
}

// ==================== AUTO-LOSS (COMPLETELY ISOLATED) ====================
async function handleAutoLoss(userId, gameRound, betAmount) {
  // Wait a tiny bit to let the main process finish
  await new Promise(r => setTimeout(r, 100));
  
  try {
    const betPaisa = Math.round(betAmount * 100);
    
    // Update spin if it still exists and is pending
    await prisma.casinoSpin.updateMany({
      where: {
        userId: userId,
        gameRound: gameRound,
        status: 'PENDING'
      },
      data: { status: 'COMPLETED' }
    });
    
    // Update turnover in background
    updateTurnover(
      userId,
      betPaisa,
      0,
      betPaisa,
      'casino_auto_loss',
      gameRound
    ).catch(e => {});
    
    // Remove from tracker
    betTracker.removeBet(gameRound);
    
    console.log(`✅ Auto-loss done: ${gameRound}`);
  } catch (error) {
    console.error('Auto-loss error:', error.message);
  }
}

// ==================== CORE FUNCTIONS ====================
function determineCallbackType(betAmount, winAmount) {
  if (betAmount > 0 && winAmount === 0) return 'BET_PLACED';
  if (betAmount === 0 && winAmount > 0) return 'GAME_WIN';
  if (betAmount === 0 && winAmount === 0) return 'GAME_CRASH';
  if (betAmount > 0 && winAmount > 0) return 'REGULAR_RESULT';
  return 'UNKNOWN';
}

async function handleBetPlaced(userId, gameRound, betAmount, currentBalance, matchId) {
  const betPaisa = Math.round(betAmount * 100);
  const newBalance = currentBalance - betPaisa;
  
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { balance: newBalance } });
    await tx.casinoSpin.create({
      data: {
        userId, gameCode: 'CRASH', gameName: 'Crash Game',
        betAmount: betPaisa, winAmount: 0, netResult: -betPaisa,
        gameRound, timestamp: new Date(), status: 'PENDING', matchId: matchId || null
      }
    });
  });
  
  return newBalance;
}

async function handleGameWin(userId, gameRound, winAmount, currentBalance, matchId) {
  const winPaisa = Math.round(winAmount * 100);
  const newBalance = currentBalance + winPaisa;
  
  const result = await prisma.$transaction(async (tx) => {
    const pendingSpin = await tx.casinoSpin.findFirst({ where: { userId, gameRound, status: 'PENDING' } });
    
    if (!pendingSpin) {
      await tx.user.update({ where: { id: userId }, data: { balance: newBalance } });
      return null;
    }
    
    await tx.casinoSpin.update({ where: { id: pendingSpin.id }, data: { winAmount: winPaisa, netResult: winPaisa, status: 'COMPLETED' } });
    await tx.user.update({ where: { id: userId }, data: { balance: newBalance } });
    return pendingSpin;
  });
  
  if (result?.betAmount) {
    const turnover = Math.max(1, Math.round(result.betAmount * 0.005));
    setTimeout(() => {
      updateTurnover(userId, result.betAmount, winPaisa, turnover, 'casino_crash', matchId || gameRound).catch(e => {});
    }, 0);
  }
  
  return newBalance;
}

async function handleGameCrash(userId, gameRound, currentBalance) {
  const pendingSpin = await prisma.casinoSpin.findFirst({ where: { userId, gameRound, status: 'PENDING' } });
  
  if (pendingSpin) {
    await prisma.casinoSpin.update({ where: { id: pendingSpin.id }, data: { status: 'COMPLETED' } });
    
    setTimeout(() => {
      updateTurnover(userId, pendingSpin.betAmount, 0, pendingSpin.betAmount, 'casino_crash', gameRound).catch(e => {});
    }, 0);
  }
  
  return currentBalance;
}

async function handleRegularResult(userId, gameRound, betAmount, winAmount, currentBalance, matchId) {
  const betPaisa = Math.round(betAmount * 100);
  const winPaisa = Math.round(winAmount * 100);
  const newBalance = currentBalance + (winPaisa - betPaisa);
  
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { balance: newBalance } });
    await tx.casinoSpin.create({
      data: {
        userId, gameCode: 'CASINO', gameName: 'Casino Game',
        betAmount: betPaisa, winAmount: winPaisa, netResult: winPaisa - betPaisa,
        gameRound, timestamp: new Date(), status: 'COMPLETED', matchId: matchId || null
      }
    });
  });
  
  let turnover;
  if (winPaisa === 0) turnover = betPaisa;
  else if (winPaisa >= betPaisa) turnover = Math.max(1, Math.round(betPaisa * 0.005));
  else turnover = betPaisa - winPaisa;
  
  setTimeout(() => {
    updateTurnover(userId, betPaisa, winPaisa, turnover, 'casino_slots', matchId || gameRound).catch(e => {});
  }, 0);
  
  return newBalance;
}

// ==================== HEALTH ====================
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats: betTracker.getStats()
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}