import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendCodeEmail } from '@/lib/mailer';

// POST: admin resends a user's existing Approval Code to their email,
// with a display label the admin chooses (e.g. "Approval Code",
// "Authorization Code"). This does not generate a new code or gate
// anything — it's a convenience for support requests ("what's my code?").
export async function POST(request, context) {
  try {
    const params = await context.params;
    const userId = parseInt(params.id);
    const { adminId, codeLabel } = await request.json();

    if (!adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }
    const admin = await prisma.user.findUnique({ where: { id: parseInt(adminId) } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden access" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    if (!user.approvalCode) {
      return NextResponse.json({ success: false, error: "This user has no Approval Code set." }, { status: 400 });
    }

    const label = (codeLabel || "Approval Code").trim().slice(0, 40) || "Approval Code";

    await sendCodeEmail({ to: user.email, name: user.name, code: user.approvalCode, codeLabel: label });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name,
        action: "RESEND_APPROVAL_CODE",
        details: `Emailed existing Approval Code to ${user.name} (${user.email}), labeled "${label}"`
      }
    });

    return NextResponse.json({ success: true, message: `Code sent to ${user.email}.` });
  } catch (error) {
    console.error("POST send-code error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
