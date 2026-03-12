import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

// Helper to get device fingerprint from request
async function getDeviceFingerprint() {
  const headersList = await headers();
  
  const ip = headersList.get('x-forwarded-for') || 
             headersList.get('x-real-ip') || 
             'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  const acceptLang = headersList.get('accept-language') || 'unknown';
  
  // Create unique fingerprint
  const fingerprint = require('crypto')
    .createHash('sha256')
    .update(`${ip}-${userAgent}-${acceptLang}`)
    .digest('hex');
  
  return {
    ip,
    userAgent,
    acceptLang,
    fingerprint
  };
}

// Check if device has claimed any bonus before
async function checkDeviceBonusHistory(userId, deviceFingerprint, bonusType) {
  try {
    // Look for ANY bonus claims from this device (excluding current user)
    const existingClaims = await prisma.transaction.findMany({
      where: {
        type: "BONUS",
        metadata: {
          path: ["deviceFingerprint"],
          equals: deviceFingerprint.fingerprint
        }
      },
      select: {
        userId: true,
        createdAt: true,
        metadata: true
      }
    });

    // Filter claims from other users
    const otherUserClaims = existingClaims.filter(claim => claim.userId !== userId);

    if (otherUserClaims.length > 0) {
      return {
        allowed: false,
        reason: "এই ডিভাইস থেকে ইতিমধ্যে অন্য অ্যাকাউন্টে বোনাস নেওয়া হয়েছে!",
        details: otherUserClaims
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Device check error:", error);
    return { allowed: true }; // Allow if check fails (don't block genuine users)
  }
}

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { type, amount, friendId, day } = await req.json();
    
    // Get device fingerprint
    const deviceFingerprint = await getDeviceFingerprint();

    // Get user with current balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referredBy: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // DEVICE CHECK - Prevent multiple accounts from same device
    const deviceCheck = await checkDeviceBonusHistory(userId, deviceFingerprint, type);
    if (!deviceCheck.allowed) {
      return NextResponse.json({ 
        error: deviceCheck.reason,
        details: "একটি ডিভাইস থেকে শুধুমাত্র একটি অ্যাকাউন্ট বোনাস নিতে পারবে!"
      }, { status: 403 });
    }

    let bonusAmount = 0;
    let turnoverMultiplier = 0;
    let expiryDate = null;
    let message = "";
    let metadata = {};

    switch (type) {
      case "first_deposit_300":
        // Check if already claimed
        if (user.isFirstDepositBonusClaimed) {
          return NextResponse.json({ 
            error: "ওয়েলকাম বোনাস ইতিমধ্যে নিয়েছেন!" 
          }, { status: 400 });
        }
        
        const depositAmount = user.totalDeposited / 100;
        
        if (depositAmount < 300) {
          return NextResponse.json({ 
            error: `আরও ${300 - depositAmount}৳ ডিপোজিট করে ৫,০০০৳ বোনাস নিন!` 
          }, { status: 400 });
        }
        
        if (depositAmount > 500) {
          return NextResponse.json({ 
            error: "বোনাস শুধুমাত্র ৩০০-৫০০৳ ডিপোজিটে পাওয়া যাবে!" 
          }, { status: 400 });
        }
        
        bonusAmount = Math.min(depositAmount * 0.5, 5000);
        turnoverMultiplier = 10;
        expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        message = `🎊 অভিনন্দন! ${bonusAmount}৳ ওয়েলকাম বোনাস যোগ হয়েছে!`;
        metadata = {
          bonusType: type,
          depositAmount: depositAmount,
          bonusPercentage: 50,
          turnoverRequired: bonusAmount * 10
        };
        break;

      case "red_card":
        // Check for minimum 100৳ deposit (10000 paisa)
        if (user.totalDeposited < 10000) {
          return NextResponse.json({ 
            error: "প্রথমে ১০০৳ ডিপোজিট করুন ডেইলি বোনাস পাওয়ার জন্য!" 
          }, { status: 400 });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dailyBonusesToday = await prisma.bonus.count({
          where: {
            userId: userId,
            type: "red_card",
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        });

        if (dailyBonusesToday >= 2) {
          return NextResponse.json({ 
            error: "আপনি আজকের ২টি বোনাসই নিয়েছেন! কাল আবার চেষ্টা করুন" 
          }, { status: 400 });
        }
        
        // Use provided amount from modal
        bonusAmount = parseFloat(amount);
        if (isNaN(bonusAmount) || bonusAmount < 0.50 || bonusAmount > 5.00) {
          return NextResponse.json({ 
            error: "অবৈধ বোনাস পরিমাণ!" 
          }, { status: 400 });
        }
        
        turnoverMultiplier = 0; // NO TURNOVER for daily bonus
        expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        message = `🎉 ${bonusAmount}৳ ডেইলি বোনাস যোগ হয়েছে!`;
        metadata = {
          bonusType: type,
          dailyCount: dailyBonusesToday + 1,
          maxDaily: 2,
          amount: bonusAmount
        };
        break;

      case "referral_reward":
        if (!friendId) {
          return NextResponse.json({ 
            error: "বন্ধুর আইডি প্রয়োজন" 
          }, { status: 400 });
        }
        
        // Check if already claimed for this friend using metadata
        const existingRewards = await prisma.bonus.findMany({
          where: {
            userId: userId,
            type: "referral_reward"
          }
        });

        const alreadyClaimedForFriend = existingRewards.some(bonus => {
          return bonus.metadata && bonus.metadata.friendId === friendId;
        });

        if (alreadyClaimedForFriend) {
          return NextResponse.json({ 
            error: "এই বন্ধুর জন্য রিওয়ার্ড ইতিমধ্যে নিয়েছেন!" 
          }, { status: 400 });
        }
        
        const friend = await prisma.user.findUnique({
          where: { id: friendId }
        });

        if (!friend) {
          return NextResponse.json({ 
            error: "বন্ধু পাওয়া যায়নি" 
          }, { status: 400 });
        }

        if (friend.referredById !== userId) {
          return NextResponse.json({ 
            error: "আপনি এই বন্ধুকে রেফার করেননি" 
          }, { status: 400 });
        }

        if (friend.totalDeposited < 30000) {
          return NextResponse.json({ 
            error: `বন্ধুকে ৩০০৳ ডিপোজিট করতে হবে! বর্তমান: ${friend.totalDeposited/100}৳` 
          }, { status: 400 });
        }

        if (friend.totalTurnover < 300000) {
          const needed = (300000 - friend.totalTurnover) / 100;
          return NextResponse.json({ 
            error: `বন্ধুকে আরও ${needed}৳ বাজি ধরতে হবে! বর্তমান: ${friend.totalTurnover/100}৳` 
          }, { status: 400 });
        }
        
        bonusAmount = 250;
        turnoverMultiplier = 1; // 1x turnover for referral bonus
        expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        message = `💰 ২৫০৳ রেফারেল বোনাস যোগ হয়েছে!`;
        metadata = {
          bonusType: type,
          friendId: friendId,
          friendName: friend.firstName || 'বন্ধু',
          friendDeposit: friend.totalDeposited / 100,
          friendTurnover: friend.totalTurnover / 100
        };
        break;

      case "sign_in_bonus":
        // Check for minimum 100৳ deposit (10000 paisa)
        if (user.totalDeposited < 10000) {
          return NextResponse.json({ 
            error: "প্রথমে ১০০৳ ডিপোজিট করুন সাইন ইন বোনাস পাওয়ার জন্য!" 
          }, { status: 400 });
        }

        if (!day) {
          return NextResponse.json({ 
            error: "দিনের তথ্য প্রয়োজন" 
          }, { status: 400 });
        }

        // Check if already claimed today
        const signInToday = new Date();
        signInToday.setHours(0, 0, 0, 0);
        const signInTomorrow = new Date(signInToday);
        signInTomorrow.setDate(signInTomorrow.getDate() + 1);

        const existingSignInToday = await prisma.bonus.findFirst({
          where: {
            userId: userId,
            type: "sign_in_bonus",
            createdAt: {
              gte: signInToday,
              lt: signInTomorrow
            }
          }
        });

        if (existingSignInToday) {
          return NextResponse.json({ 
            error: "আজ ইতিমধ্যে সাইন ইন বোনাস নিয়েছেন! কাল আবার চেষ্টা করুন" 
          }, { status: 400 });
        }

        // Get all sign-in bonuses to check if this day was claimed
        const existingSignInBonuses = await prisma.bonus.findMany({
          where: {
            userId: userId,
            type: "sign_in_bonus"
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        // Calculate expected next day
        const expectedDay = (existingSignInBonuses.length % 7) + 1;
        
        if (day !== expectedDay) {
          return NextResponse.json({ 
            error: `আপনি প্রথমে দিন ${expectedDay} এর বোনাস নিন!` 
          }, { status: 400 });
        }

        // Check if this specific day was already claimed (safety check)
        const dayAlreadyClaimed = existingSignInBonuses.some(bonus => {
          return bonus.metadata && bonus.metadata.day === day;
        });

        if (dayAlreadyClaimed) {
          return NextResponse.json({ 
            error: `দিন ${day} এর বোনাস ইতিমধ্যে নিয়েছেন!` 
          }, { status: 400 });
        }

        // Amount is passed from frontend based on day
        bonusAmount = parseFloat(amount);
        if (isNaN(bonusAmount) || bonusAmount < 5 || bonusAmount > 40) {
          return NextResponse.json({ 
            error: "অবৈধ বোনাস পরিমাণ!" 
          }, { status: 400 });
        }

        turnoverMultiplier = 0; // No turnover for sign-in bonus
        expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        message = `✅ দিন ${day} এর ${bonusAmount}৳ সাইন ইন বোনাস যোগ হয়েছে!`;
        metadata = {
          bonusType: type,
          day: day,
          weekPosition: day,
          totalClaimed: existingSignInBonuses.length + 1
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid bonus type" }, { status: 400 });
    }

    // Convert to paisa
    const bonusAmountPaisa = Math.round(bonusAmount * 100);
    const turnoverAmountPaisa = bonusAmountPaisa * turnoverMultiplier;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user balance
      const updateData = {
        balance: { increment: bonusAmountPaisa },
        totalBonusGiven: { increment: bonusAmountPaisa },
        lastBonusClaimedAt: new Date(),
        ...(type === "first_deposit_300" && { isFirstDepositBonusClaimed: true })
      };

      // Only lock balance if turnover required
      if (turnoverMultiplier > 0) {
        updateData.lockedBalance = { increment: bonusAmountPaisa };
      }

      await tx.user.update({
        where: { id: userId },
        data: updateData
      });

      // Create bonus record with metadata
      const bonus = await tx.bonus.create({
        data: {
          userId: userId,
          type: type,
          amount: bonusAmountPaisa,
          originalAmount: bonusAmountPaisa,
          turnoverAmount: turnoverAmountPaisa,
          currentTurnover: 0,
          status: "active",
          isWithdrawable: turnoverMultiplier === 0,
          expiresAt: expiryDate,
          metadata: metadata
        }
      });

      // Create transaction record with DEVICE INFO
      await tx.transaction.create({
        data: {
          userId: userId,
          type: "BONUS",
          amount: bonusAmountPaisa,
          status: "COMPLETED",
          provider: "bonus_system",
          reference: `BONUS_${bonus.id}`,
          metadata: {
            ...metadata,
            deviceFingerprint: deviceFingerprint.fingerprint,
            deviceIp: deviceFingerprint.ip,
            userAgent: deviceFingerprint.userAgent.substring(0, 200),
            claimedAt: new Date().toISOString(),
            bonusId: bonus.id
          }
        }
      });

      return bonus;
    });

    return NextResponse.json({
      success: true,
      message: message,
      bonus: {
        amount: bonusAmount,
        type: type,
        turnoverRequired: turnoverAmountPaisa / 100,
        turnoverMultiplier: turnoverMultiplier,
        isWithdrawable: turnoverMultiplier === 0,
        expiresAt: expiryDate,
        ...(type === "sign_in_bonus" && { day: day }),
        ...(type === "referral_reward" && { friendId: friendId })
      }
    });

  } catch (err) {
    console.error("Bonus claim error:", err);
    return NextResponse.json({ 
      error: "বোনাস ক্লেইম করতে সমস্যা হয়েছে। আবার চেষ্টা করুন!" 
    }, { status: 500 });
  }
}