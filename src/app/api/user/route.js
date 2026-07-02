import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Returns the user with fresh account balances — called by the client after
// any action that mutates account balances (transfers, admin funding, etc.)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { accounts: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Count how many outgoing transfers this user has made today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const accountNumbers = user.accounts.map(a => a.accountNumber);

    const transfersToday = await prisma.transaction.count({
      where: {
        senderAccountNumber: { in: accountNumbers },
        type: 'TRANSFER',
        status: 'COMPLETED',
        createdAt: { gte: startOfToday }
      }
    });

    const transfersRemaining = user.transferCount > 0
      ? Math.max(0, user.transferCount - transfersToday)
      : null;

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: { ...userWithoutPassword, transfersToday, transfersRemaining }
    });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
