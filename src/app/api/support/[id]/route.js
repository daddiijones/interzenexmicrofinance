import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const ticketId = parseInt(params.id);

    const { adminId, adminReply, status } = await request.json();

    if (!adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: parseInt(adminId) }
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden access" }, { status: 403 });
    }

    const originalTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!originalTicket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        adminReply: adminReply || "",
        status: status || "RESOLVED"
      }
    });

    // Log this audit event
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name,
        action: "REPLY_SUPPORT_TICKET",
        details: `Replied to ticket #${ticketId} ("${originalTicket.subject}"): "${adminReply}"`
      }
    });

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully",
      ticket: updatedTicket
    });
  } catch (error) {
    console.error("PATCH support ticket error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
