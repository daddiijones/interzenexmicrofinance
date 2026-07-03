import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

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

// PATCH: self-service profile update — name, email, and/or password.
// Account number, status, daily limit, transfer count, and approval code
// stay admin-controlled and aren't accepted here.
export async function PATCH(request) {
  try {
    const { userId, name, email, currentPassword, newPassword } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const data = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ success: false, error: "Name cannot be empty." }, { status: 400 });
      }
      data.name = name.trim();
    }

    if (email !== undefined && email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
      if (existing) {
        return NextResponse.json({ success: false, error: "That email is already in use." }, { status: 400 });
      }
      data.email = trimmedEmail;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: "Enter your current password to set a new one." }, { status: 400 });
      }
      const matches = await bcrypt.compare(currentPassword, user.password);
      if (!matches) {
        return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 401 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: "New password must be at least 6 characters." }, { status: 400 });
      }
      data.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "No changes to save." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      include: { accounts: true }
    });

    const { password: _, ...userWithoutPassword } = updated;

    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("PATCH /api/user error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
