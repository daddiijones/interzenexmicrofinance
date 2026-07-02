import prisma from "@/lib/db";
import { sendOtpEmail } from "@/lib/mailer";

export const OTP_EXPIRY_MINUTES = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = Number(
  process.env.OTP_RESEND_COOLDOWN_SECONDS || 60
);

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function cooldownRemaining(otpLastSentAt) {
  if (!otpLastSentAt) return 0;
  const elapsedSeconds = (Date.now() - new Date(otpLastSentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds));
}

// Generates a fresh OTP, persists it, and emails it to the user.
export async function issueOtp(user) {
  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: code, otpExpiresAt: expiresAt, otpLastSentAt: now },
  });

  await sendOtpEmail({
    to: user.email,
    name: user.name,
    code,
    expiryMinutes: OTP_EXPIRY_MINUTES,
  });

  return { cooldown: OTP_RESEND_COOLDOWN_SECONDS };
}
