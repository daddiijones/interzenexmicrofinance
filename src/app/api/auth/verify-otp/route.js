import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json({ success: false, error: "Verification code is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { accounts: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid session. Please log in again." }, { status: 404 });
    }

    if (user.status === "SUSPENDED" || user.status === "REJECTED") {
      return NextResponse.json({ success: false, error: "This account cannot sign in. Please contact support." }, { status: 403 });
    }

    if (!user.otpCode) {
      return NextResponse.json({ success: false, error: "No active verification code. Please log in again." }, { status: 400 });
    }

    if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
      return NextResponse.json({ success: false, expired: true, error: "This code has expired. Please request a new one." }, { status: 400 });
    }

    if (code.trim() !== user.otpCode) {
      return NextResponse.json({ success: false, error: "Incorrect verification code." }, { status: 401 });
    }

    // Code is valid — clear it so it can't be reused, and complete login.
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: "", otpExpiresAt: null, otpLastSentAt: null },
      include: { accounts: true }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Verify OTP error: ", error);
    return NextResponse.json({ success: false, error: "An error occurred during verification." }, { status: 500 });
  }
}
