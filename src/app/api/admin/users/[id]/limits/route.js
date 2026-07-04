import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const userId = parseInt(params.id);

    const {
      adminId,
      dailyLimit,
      status,
      transferCount,
      restrictionMessage,
      approvalCode,
      createdAt
    } = await request.json();

    if (!adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: parseInt(adminId) }
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden access" }, { status: 403 });
    }

    const originalUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!originalUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyLimit: dailyLimit !== undefined ? parseFloat(dailyLimit) : undefined,
        status: status || undefined,
        transferCount: transferCount !== undefined ? parseInt(transferCount) : undefined,
        restrictionMessage: restrictionMessage !== undefined ? restrictionMessage : undefined,
        approvalCode: approvalCode !== undefined ? approvalCode : undefined,
        createdAt: createdAt ? new Date(createdAt) : undefined
      }
    });

    const changes = [];
    if (dailyLimit !== undefined && originalUser.dailyLimit !== parseFloat(dailyLimit)) {
      changes.push(`daily limit changed from $${originalUser.dailyLimit} to $${dailyLimit}`);
    }
    if (status !== undefined && originalUser.status !== status) {
      changes.push(`status changed from ${originalUser.status} to ${status}`);
    }
    if (transferCount !== undefined && originalUser.transferCount !== parseInt(transferCount)) {
      changes.push(`transfer count changed from ${originalUser.transferCount} to ${transferCount} per day`);
    }
    if (approvalCode !== undefined && originalUser.approvalCode !== approvalCode) {
      changes.push(`approval code updated`);
    }
    if (createdAt) {
      changes.push(`join date backdated to ${new Date(createdAt).toLocaleDateString()}`);
    }

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name,
        action: "UPDATE_USER_LIMITS",
        details: `Updated user ${updatedUser.name} (${updatedUser.email}): ${changes.join(', ') || 'no changes'}`
      }
    });

    return NextResponse.json({
      success: true,
      message: "User settings updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("PATCH admin user limits error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
