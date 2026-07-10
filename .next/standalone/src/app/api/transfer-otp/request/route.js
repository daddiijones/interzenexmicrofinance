import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { issueTransferOtp, transferOtpCooldownRemaining } from '@/lib/transferOtp';

// POST: issue (or resend) a one-time verification code the user must enter
// to finalize a transfer. Called both when the confirm screen first opens
// and from the OTP modal's "resend" button — same cooldown-gated flow as login OTP.
export async function POST(request) {
  try {
    const { userId, amount, currency, receiverName } = await request.json();

    if (!userId || !amount || !currency || !receiverName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.status === "SUSPENDED" || user.status === "REJECTED" || user.status === "PENDING_APPROVAL") {
      return NextResponse.json({ success: false, error: "This account cannot initiate transfers." }, { status: 403 });
    }

    const remaining = transferOtpCooldownRemaining(user.transferOtpLastSentAt);
    if (remaining > 0) {
      return NextResponse.json({
        success: false,
        error: `Please wait ${remaining}s before requesting a new code.`,
        retryAfter: remaining
      }, { status: 429 });
    }

    const { cooldown } = await issueTransferOtp(user, { amount, currency, receiverName });

    return NextResponse.json({
      success: true,
      message: "A verification code has been sent to your email",
      cooldown
    });
  } catch (error) {
    console.error("Transfer OTP request error: ", error);
    return NextResponse.json({ success: false, error: "An error occurred while sending the verification code." }, { status: 500 });
  }
}
