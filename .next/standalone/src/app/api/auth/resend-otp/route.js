import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { issueOtp, cooldownRemaining } from '@/lib/otp';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid session. Please log in again." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid session. Please log in again." }, { status: 404 });
    }

    const remaining = cooldownRemaining(user.otpLastSentAt);
    if (remaining > 0) {
      return NextResponse.json({
        success: false,
        error: `Please wait ${remaining}s before requesting a new code.`,
        retryAfter: remaining
      }, { status: 429 });
    }

    const { cooldown } = await issueOtp(user);

    return NextResponse.json({
      success: true,
      message: "A new verification code has been sent to your email",
      cooldown
    });
  } catch (error) {
    console.error("Resend OTP error: ", error);
    return NextResponse.json({ success: false, error: "An error occurred while resending the code." }, { status: 500 });
  }
}
