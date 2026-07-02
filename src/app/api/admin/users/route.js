import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: parseInt(adminId) }
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden access" }, { status: 403 });
    }

    // Retrieve all users (except other admins, or include them, let's include normal users)
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      include: {
        accounts: true,
        loans: true,
        tickets: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Count how many transfers each user has made today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Collect all account numbers across all users
    const allAccountNumbers = users.flatMap(u => u.accounts.map(a => a.accountNumber));

    // One query for all outgoing transfers today
    const todayTxGroups = await prisma.transaction.groupBy({
      by: ['senderAccountNumber'],
      where: {
        senderAccountNumber: { in: allAccountNumbers },
        type: 'TRANSFER',
        status: 'COMPLETED',
        createdAt: { gte: startOfToday }
      },
      _count: { id: true }
    });

    const txCountByAccount = new Map(
      todayTxGroups.map(g => [g.senderAccountNumber, g._count.id])
    );

    // Annotate each user with transfersToday and transfersRemaining
    const usersWithCounts = users.map(u => {
      const transfersToday = u.accounts.reduce((sum, acc) => {
        return sum + (txCountByAccount.get(acc.accountNumber) || 0);
      }, 0);
      return {
        ...u,
        transfersToday,
        transfersRemaining: u.transferCount > 0
          ? Math.max(0, u.transferCount - transfersToday)
          : null
      };
    });

    // Retrieve total transaction list for audit
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Fetch audit logs
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Compute basic platform stats
    const totalDeposits = await prisma.account.aggregate({
      _sum: {
        balance: true
      }
    });

    const activeTicketsCount = await prisma.supportTicket.count({
      where: { status: "OPEN" }
    });

    const loansCount = await prisma.loan.count({
      where: { status: "PENDING" }
    });

    return NextResponse.json({
      success: true,
      users: usersWithCounts,
      transactions,
      auditLogs,
      stats: {
        totalDeposits: totalDeposits._sum.balance || 0,
        activeTicketsCount,
        pendingLoansCount: loansCount
      }
    });
  } catch (error) {
    console.error("GET admin users error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
