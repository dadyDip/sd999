import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Get all sign-in bonuses for this user - WITHOUT metadata field
    const signInBonuses = await prisma.bonus.findMany({
      where: {
        userId: userId,
        type: "sign_in_bonus"
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        // REMOVED metadata field since it doesn't exist
      }
    });

    // Format the history - since we don't have metadata, we'll use the array index + 1 as day
    const history = signInBonuses.map((bonus, index) => {
      return {
        id: bonus.id,
        day: index + 1, // Use index as day number
        amount: bonus.amount / 100,
        claimedAt: bonus.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error("Error fetching sign-in history:", error);
    return NextResponse.json({ 
      error: "Failed to fetch history" 
    }, { status: 500 });
  }
}