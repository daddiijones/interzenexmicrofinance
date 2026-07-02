import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const accountId = parseInt(params.id);

    const { adminId, balance } = await request.json();

    if (!adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: parseInt(adminId) }
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden access" }, { status: 403 });
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });
    }

    const newBalance = parseFloat(balance);
    if (isNaN(newBalance) || newBalance < 0) {
      return NextResponse.json({ success: false, error: "Invalid balance amount" }, { status: 400 });
    }

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance }
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name,
        action: "UPDATE_ACCOUNT_BALANCE",
        details: `Updated ${account.type} account #${account.accountNumber} balance from ${account.currency} ${account.balance.toFixed(2)} to ${account.currency} ${newBalance.toFixed(2)}`
      }
    });

    return NextResponse.json({
      success: true,
      message: "Account balance updated successfully",
      account: updatedAccount
    });
  } catch (error) {
    console.error("PATCH admin account balance error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
