import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { seedUserTransactions, generateAccountNumber, generateApprovalCode } from '@/lib/seedHelper';

export async function POST(request) {
  try {
    const { email, password, name, currency, country, address, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Please fill in all fields." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email is already registered." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userAccountNumber = generateAccountNumber();
    const userApprovalCode = generateApprovalCode();

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role: "USER",
        country: country || "",
        address: address || "",
        phone: phone || "",
        accountNumber: userAccountNumber,
        dailyLimit: 5000.00,
        status: "PENDING_APPROVAL",
        transferCount: 5,
        approvalCode: userApprovalCode,
        restrictionMessage: "You have reached your daily transfer limit. Please contact support to obtain your Approval Code to authorise this transaction."
      }
    });

    // Seed this user with default balances and backdated transactions
    await seedUserTransactions(user.id, user.email, user.name, currency || "USD");

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { accounts: true }
    });

    const { password: _, ...userWithoutPassword } = fullUser;

    return NextResponse.json({
      success: true,
      message: "Registration successful! Seeded transactions generated.",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Registration error: ", error);
    return NextResponse.json({ success: false, error: "An error occurred during registration." }, { status: 500 });
  }
}
