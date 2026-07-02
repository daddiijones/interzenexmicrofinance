import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { seedUserTransactions, generateAccountNumber, generateApprovalCode } from '@/lib/seedHelper';

export async function GET() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  try {
    // 1. Clear database
    await prisma.transaction.deleteMany({});
    await prisma.card.deleteMany({});
    await prisma.loan.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create Admin
    const adminPasswordHash = await bcrypt.hash("admin2026!", 10);
    const admin = await prisma.user.create({
      data: {
        email: "admin@interzenexmicrofinance.online",
        password: adminPasswordHash,
        name: "Interzenex Administrator",
        role: "ADMIN",
        accountNumber: "9999999999",
        status: "ACTIVE"
      }
    });

    // 3. Create normal users
    const userPasswordHash = await bcrypt.hash("password123", 10);

    const usersToCreate = [
      {
        email: "john@interzenexmicrofinance.online",
        name: "John Doe",
        accountNumber: "1029384756",
        dailyLimit: 2500.00,
        status: "ACTIVE",
        transferCount: 3,
        approvalCode: "APR-8812",
        restrictionMessage: "You have reached your daily transfer allowance of 3 transfers. Please contact Interzenex Microfinance Support to obtain your Approval Code to authorise additional transfers."
      },
      {
        email: "sarah@interzenexmicrofinance.online",
        name: "Sarah Connor",
        accountNumber: "4938271056",
        dailyLimit: 500.00,
        status: "RESTRICTED",
        transferCount: 1,
        approvalCode: "APR-4921",
        restrictionMessage: "Your account has a 1-transfer daily allowance and you have reached it. Enter your Approval Code to proceed with this transaction."
      },
      {
        email: "michael@interzenexmicrofinance.online",
        name: "Michael Scott",
        accountNumber: "8271049382",
        dailyLimit: 1000.00,
        status: "SUSPENDED",
        transferCount: 5,
        approvalCode: "APR-3810",
        restrictionMessage: "Account suspended due to compliance review. Direct out-of-branch transfers are disabled."
      }
    ];

    const seededUsers = [];
    for (const u of usersToCreate) {
      const user = await prisma.user.create({
        data: {
          email: u.email,
          password: userPasswordHash,
          name: u.name,
          role: "USER",
          accountNumber: u.accountNumber,
          dailyLimit: u.dailyLimit,
          status: u.status,
          transferCount: u.transferCount,
          approvalCode: u.approvalCode,
          restrictionMessage: u.restrictionMessage
        }
      });
      seededUsers.push(user);
    }

    // 4. Seed user histories (accounts, cards, backdated transactions)
    for (const user of seededUsers) {
      await seedUserTransactions(user.id, user.email, user.name, "USD");
    }

    // 5. Seed some support tickets
    await prisma.supportTicket.create({
      data: {
        userId: seededUsers[0].id,
        subject: "Need Approval Code for Urgent Transfer",
        message: "Hello support, I need to make an additional transfer today but have reached my daily limit. Could you please provide my Approval Code?",
        status: "OPEN"
      }
    });

    await prisma.supportTicket.create({
      data: {
        userId: seededUsers[1].id,
        subject: "Transfer blocked after reaching daily count",
        message: "My transfer is blocked after reaching my daily limit. It is asking for an Approval Code. Please assist.",
        status: "RESOLVED",
        adminReply: "Your Approval Code is APR-4921. Please enter this code inside the transfer dialog to complete your transaction."
      }
    });

    // 6. Log system seed action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name,
        action: "DATABASE_RESET_SEED",
        details: "Reset database and seeded initial admin account, 3 user accounts with full historical backdated transactions, and initial support tickets."
      }
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      users: seededUsers.map(u => ({ email: u.email, status: u.status, transferCount: u.transferCount, approvalCode: u.approvalCode })),
      admin: { email: admin.email }
    });
  } catch (error) {
    console.error("Seeding error: ", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
