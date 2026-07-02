import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT || 2525),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
      // Shared cPanel hosting serves mail behind a wildcard cert (*.web-hosting.com)
      // that doesn't match mail.<yourdomain> — strict verification fails even with
      // correct credentials, so relax it here.
      tls: { rejectUnauthorized: false },
    });
  }
  return transporter;
}

function otpEmailHtml({ name, code, expiryMinutes }) {
  return `
  <div style="background:#0b1220;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">
      <tr>
        <td style="background:linear-gradient(135deg,#0ea5e9,#10b981);padding:24px 32px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.02em;">Interzenex Microfinance</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <p style="color:#e2e8f0;font-size:15px;margin:0 0 8px;">Hi ${name || "there"},</p>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Use the verification code below to finish signing in to your Interzenex Microfinance account.
          </p>
          <div style="background:#0b1220;border:1px solid #1f2937;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="color:#34d399;font-size:32px;font-weight:700;letter-spacing:0.3em;">${code}</span>
          </div>
          <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 4px;">
            This code expires in ${expiryMinutes} minutes.
          </p>
          <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
            If you didn't request this code, you can safely ignore this email — no one can access your account without it.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;border-top:1px solid #1f2937;">
          <p style="color:#475569;font-size:11px;margin:0;">
            Interzenex Microfinance • 256-bit encrypted • Never share this code with anyone, including Interzenex Microfinance staff.
          </p>
        </td>
      </tr>
    </table>
  </div>`;
}

export async function sendOtpEmail({ to, name, code, expiryMinutes = 5 }) {
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || "Interzenex Microfinance <support@interzenexmicrofinance.online>",
    to,
    subject: `${code} is your Interzenex Microfinance verification code`,
    text: `Your Interzenex Microfinance verification code is ${code}. It expires in ${expiryMinutes} minutes. If you didn't request this, you can ignore this email.`,
    html: otpEmailHtml({ name, code, expiryMinutes }),
  });
}
