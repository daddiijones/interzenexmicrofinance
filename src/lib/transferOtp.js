import prisma from "@/lib/db";
import { sendTransferOtpEmail } from "@/lib/mailer";

export const TRANSFER_OTP_EXPIRY_MINUTES = 5;
export const TRANSFER_OTP_RESEND_COOLDOWN_SECONDS = Number(
  process.env.OTP_RESEND_COOLDOWN_SECONDS || 60
);

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function transferOtpCooldownRemaining(lastSentAt) {
  if (!lastSentAt) return 0;
  const elapsedSeconds = (Date.now() - new Date(lastSentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(TRANSFER_OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds));
}

// Generates a fresh transfer OTP, persists it, and emails it to the user.
export async function issueTransferOtp(user, { amount, currency, receiverName }) {
  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TRANSFER_OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { transferOtpCode: code, transferOtpExpiresAt: expiresAt, transferOtpLastSentAt: now },
  });

  await sendTransferOtpEmail({
    to: user.email,
    name: user.name,
    code,
    expiryMinutes: TRANSFER_OTP_EXPIRY_MINUTES,
    amount,
    currency,
    receiverName,
  });

  return { cooldown: TRANSFER_OTP_RESEND_COOLDOWN_SECONDS };
}
