// app/api/callback/jili/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/prisma';
import { updateTurnover } from '@/lib/turnover-tracker';

// Simple tracker for Jili pending bets
class JiliBetTracker {
  constructor() {
    this.pendingBets = new Map(); // gameRound -> { userId, betAmount, matchId }
    this.CLEANUP_INTERVAL = 3600000; // 1 hour cleanup
    
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }
  
  addPendingBet(gameRound, userId, betAmount, matchId) {
    this.pendingBets.set(gameRound, {
      userId,
      betAmount,
      matchId,
      timestamp: Date.now()
    });
    console.log(`📝 Added JILI pending bet:`, { gameRound, userId, betAmount });
  }
  
  getAndRemovePendingBet(gameRound) {
    const bet = this.pendingBets.get(gameRound);
    if (bet) {
      this.pendingBets.delete(gameRound);
      console.log(`✅ Removed JILI pending bet:`, { gameRound });
    }
    return bet;
  }
  
  async processUserPendingBets(userId, currentGameRound) {
    const userPendingBets = [];
    
    for (const [gameRound, bet] of this.pendingBets.entries()) {
      if (bet.userId === userId && gameRound !== currentGameRound) {
        userPendingBets.push({ gameRound, ...bet });
      }
    }
    
    if (userPendingBets.length === 0) return;
    
    console.log(`🔄 Processing ${userPendingBets.length} pending JILI bets for user ${userId}`);
    
    for (const pending of userPendingBets) {
      try {
        console.log(`💥 Auto-processing pending JILI bet as loss:`, {
          gameRound: pending.gameRound,
          betAmount: pending.betAmount
        });
        
        const spin = await prisma.casinoSpin.findFirst({
          where: {
            userId: userId,
            gameRound: pending.gameRound,
            status: 'PENDING'
          }
        });
        
        if (spin) {
          await prisma.$transaction(async (tx) => {
            await tx.casinoSpin.update({
              where: { id: spin.id },
              data: {
                status: 'COMPLETED',
                winAmount: 0,
                netResult: -spin.betAmount
              }
            });
          });
          
          const betPaisa = spin.betAmount;
          console.log(`💰 Applying JILI loss turnover: ${betPaisa}`);
          
          await updateTurnover(
            userId,
            betPaisa,
            0,
            betPaisa,
            'jili',
            pending.matchId || pending.gameRound
          );
          
          console.log(`✅ Pending JILI bet processed as loss`);
        }
        
        this.pendingBets.delete(pending.gameRound);
        
      } catch (error) {
        console.error('Error processing pending JILI bet:', error);
      }
    }
  }
  
  cleanup() {
    const oneDayAgo = Date.now() - 86400000;
    for (const [gameRound, bet] of this.pendingBets.entries()) {
      if (bet.timestamp < oneDayAgo) {
        this.pendingBets.delete(gameRound);
      }
    }
  }
  
  getStats() {
    return {
      pendingBets: this.pendingBets.size
    };
  }
}

const jiliTracker = new JiliBetTracker();

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const url = new URL(request.url);
    const matchId = url.searchParams.get('matchId') || '';
    
    const body = await request.json().catch(() => ({}));
    
    const memberAccount = String(body.member_account || body.player_id || body.uid || '1000');
    const betAmount = parseFloat(body.bet_amount || body.bet || body.amount || 0);
    const winAmount = parseFloat(body.win_amount || body.win || body.payout || 0);
    const gameRound = String(body.game_round || body.round_id || body.transaction_id || '');
    const casinoId = parseInt(memberAccount.replace(/\D/g, '')) || 0;
    
    if (!gameRound) {
      return NextResponse.json({ credit_amount: 0, timestamp: Date.now(), error: 'Invalid request' }, { status: 400 });
    }
    
    const user = await prisma.user.findFirst({
      where: { casinoId: casinoId },
      select: { id: true, balance: true, isBanned: true }
    });
    
    if (!user || user.isBanned) {
      return NextResponse.json({ credit_amount: 0, timestamp: Date.now(), error: 'User error' }, { status: 403 });
    }
    
    const type = determineCallbackType(betAmount, winAmount);
    
    console.log(`📥 JILI Callback [${type}]:`, { casinoId, betAmount, winAmount, gameRound, userId: user.id });
    
    let newBalance = user.balance;
    let transactionResult = null;
    
    switch(type) {
      case 'BET_PLACED':
        // Process any pending bets first
        await jiliTracker.processUserPendingBets(user.id, gameRound);
        
        transactionResult = await handleBetPlaced(user.id, gameRound, betAmount, user.balance, matchId);
        newBalance = transactionResult.newBalance;
        
        // Add to pending tracker
        jiliTracker.addPendingBet(gameRound, user.id, betAmount, matchId);
        break;
        
      case 'GAME_WIN':
        jiliTracker.getAndRemovePendingBet(gameRound);
        transactionResult = await handleGameWin(user.id, gameRound, winAmount, user.balance, matchId);
        newBalance = transactionResult.newBalance;
        break;
        
      case 'REGULAR_RESULT':
        jiliTracker.getAndRemovePendingBet(gameRound);
        transactionResult = await handleRegularResult(user.id, gameRound, betAmount, winAmount, user.balance, matchId);
        newBalance = transactionResult.newBalance;
        break;
        
      default:
        console.log(`ℹ️ JILI: Unknown type ${type}, treating as regular`);
        transactionResult = await handleRegularResult(user.id, gameRound, betAmount, winAmount, user.balance, matchId);
        newBalance = transactionResult.newBalance;
    }
    
    const creditAmount = parseFloat((newBalance / 100).toFixed(2));
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ JILI ${type} processed in ${processingTime}ms:`, {
      oldBalance: (user.balance / 100).toFixed(2),
      newBalance: (newBalance / 100).toFixed(2),
      netChange: ((newBalance - user.balance) / 100).toFixed(2),
      turnoverApplied: transactionResult?.turnoverApplied || 0
    });
    
    return NextResponse.json({
      credit_amount: creditAmount,
      timestamp: Date.now(),
      balance_paisa: newBalance
    });
    
  } catch (error) {
    console.error('🔥 JILI Callback error:', error.message);
    return NextResponse.json({ credit_amount: 0, timestamp: Date.now(), error: 'Internal error' }, { status: 500 });
  }
}

function determineCallbackType(betAmount, winAmount) {
  if (betAmount > 0 && winAmount === 0) return 'BET_PLACED';
  if (betAmount === 0 && winAmount > 0) return 'GAME_WIN';
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
        userId, gameCode: 'JILI', gameName: 'Jili Game',
        betAmount: betPaisa, winAmount: 0, netResult: -betPaisa,
        gameRound, timestamp: new Date(), status: 'PENDING', matchId
      }
    });
  });
  
  return { betPaisa, newBalance };
}

async function handleGameWin(userId, gameRound, winAmount, currentBalance, matchId) {
  const winPaisa = Math.round(winAmount * 100);
  const newBalance = currentBalance + winPaisa;
  let turnoverApplied = 0;
  
  const result = await prisma.$transaction(async (tx) => {
    const pendingSpin = await tx.casinoSpin.findFirst({ where: { userId, gameRound, status: 'PENDING' } });
    
    if (!pendingSpin) {
      const newSpin = await tx.casinoSpin.create({
        data: {
          userId, gameCode: 'JILI', gameName: 'Jili Game',
          betAmount: 0, winAmount: winPaisa, netResult: winPaisa,
          gameRound, timestamp: new Date(), status: 'COMPLETED', matchId
        }
      });
      await tx.user.update({ where: { id: userId }, data: { balance: newBalance } });
      return newSpin;
    }
    
    const updatedSpin = await tx.casinoSpin.update({
      where: { id: pendingSpin.id },
      data: { winAmount: winPaisa, netResult: winPaisa - pendingSpin.betAmount, status: 'COMPLETED' }
    });
    
    await tx.user.update({ where: { id: userId }, data: { balance: newBalance } });
    return updatedSpin;
  });
  
  if (result.betAmount > 0) {
    const effectiveTurnover = Math.max(1, Math.round(result.betAmount * 0.005));
    turnoverApplied = effectiveTurnover;
    
    try {
      await updateTurnover(userId, result.betAmount, winPaisa, effectiveTurnover, 'jili', matchId || gameRound);
    } catch (e) { console.error('Turnover error:', e); }
  }
  
  return { winPaisa, newBalance, turnoverApplied };
}

async function handleRegularResult(userId, gameRound, betAmount, winAmount, currentBalance, matchId) {
  const betPaisa = Math.round(betAmount * 100);
  const winPaisa = Math.round(winAmount * 100);
  const netChange = winPaisa - betPaisa;
  const newBalance = currentBalance + netChange;
  let turnoverApplied = 0;
  
  await prisma.$transaction(async (tx) => {
    const existingSpin = await tx.casinoSpin.findFirst({ where: { userId, gameRound } });
    
    if (existingSpin) {
      await tx.casinoSpin.update({
        where: { id: existingSpin.id },
        data: { winAmount: winPaisa, netResult: netChange, status: 'COMPLETED' }
      });
    } else {
      await tx.casinoSpin.create({
        data: {
          userId, gameCode: 'JILI', gameName: 'Jili Game',
          betAmount: betPaisa, winAmount: winPaisa, netResult: netChange,
          gameRound, timestamp: new Date(), status: 'COMPLETED', matchId
        }
      });
    }
    
    await tx.user.update({ where: { id: userId }, data: { balance: newBalance } });
  });
  
  if (winPaisa === 0) turnoverApplied = betPaisa;
  else if (winPaisa >= betPaisa) turnoverApplied = Math.max(1, Math.round(betPaisa * 0.005));
  else turnoverApplied = betPaisa - winPaisa;
  
  try {
    await updateTurnover(userId, betPaisa, winPaisa, turnoverApplied, 'jili', matchId || gameRound);
  } catch (e) { console.error('Turnover error:', e); }
  
  return { betPaisa, winPaisa, newBalance, turnoverApplied };
}

export async function GET() {
  return NextResponse.json({ status: 'JILI callback handler healthy', stats: jiliTracker.getStats() });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } });
}