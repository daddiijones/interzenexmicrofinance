import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const adminId = searchParams.get('adminId');

    if (adminId) {
      const admin = await prisma.user.findUnique({
        where: { id: parseInt(adminId) }
      });
      if (admin && admin.role === "ADMIN") {
        const tickets = await prisma.supportTicket.findMany({
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, tickets });
      }
      return NextResponse.json({ success: false, error: "Forbidden access" }, { status: 403 });
    }

    if (userId) {
      const tickets = await prisma.supportTicket.findMany({
        where: { userId: parseInt(userId) },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, tickets });
    }

    return NextResponse.json({ success: false, error: "UserId or AdminId is required" }, { status: 400 });
  } catch (error) {
    console.error("GET support tickets error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, subject, message } = await request.json();

    if (!userId || !subject || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: parseInt(userId),
        subject,
        message,
        status: "OPEN"
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("POST support ticket error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
