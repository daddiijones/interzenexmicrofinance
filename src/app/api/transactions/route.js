import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { convertCurrency } from '@/lib/currencies';

// GET: Retrieve all transactions for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: "UserId is required" }, { status: 400 });
    }

    const id = parseInt(userId);

    const user = await prisma.user.findUnique({
      where: { id },
      include: { accounts: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const accountNumbers = user.accounts.map(acc => acc.accountNumber);

    // Find transactions where this user is sender or receiver
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderAccountNumber: { in: accountNumbers } },
          { receiverAccountNumber: { in: accountNumbers } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error("GET transactions error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Execute a new transaction
export async function POST(request) {
  try {
    const {
      userId,
      senderAccountId,
      receiverAccountNumber,
      receiverBank,
      receiverName,
      amount,
      currency,
      description,
      approvalCode
    } = await request.json();

    if (!userId || !senderAccountId || !receiverAccountNumber || !amount || !currency) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const uId = parseInt(userId);
    const sAccId = parseInt(senderAccountId);
    const transAmount = parseFloat(amount);

    // 1. Fetch user and sender account
    const user = await prisma.user.findUnique({
      where: { id: uId }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json({ success: false, error: "Your account is suspended." }, { status: 403 });
    }

    const senderAccount = await prisma.account.findFirst({
      where: { id: sAccId, userId: uId }
    });

    if (!senderAccount) {
      return NextResponse.json({ success: false, error: "Sender account not found" }, { status: 404 });
    }

    // Convert the requested amount into the sender's account currency before
    // touching its balance — accounts can be denominated in any world currency.
    const amountInAccCurrency = convertCurrency(transAmount, currency, senderAccount.currency);

    if (senderAccount.balance < amountInAccCurrency) {
      return NextResponse.json({ success: false, error: "Insufficient funds in checking/savings balance." }, { status: 400 });
    }

    // 2. Transfer Count Check — count how many completed transfers the user has made today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayTransactions = await prisma.transaction.findMany({
      where: {
        senderAccountNumber: senderAccount.accountNumber,
        createdAt: { gte: startOfToday },
        status: "COMPLETED"
      }
    });

    const todayCount = todayTransactions.length;
    // transferCount of 0 means unlimited
    const limitActive = user.transferCount > 0;
    const countExceeded = limitActive && todayCount >= user.transferCount;
    const isRestrictedByAdmin = user.status === "RESTRICTED";

    const remaining = limitActive ? Math.max(0, user.transferCount - todayCount) : null;

    if (countExceeded || isRestrictedByAdmin) {
      if (!approvalCode) {
        return NextResponse.json({
          success: false,
          limitExceeded: true,
          restrictionMessage: user.restrictionMessage ||
            `You have used all ${user.transferCount} of your daily transfer allowances. Please obtain your Approval Code to authorise this transaction.`,
          error: "Approval Code required to proceed."
        }, { status: 403 });
      }

      if (approvalCode.trim().toUpperCase() !== user.approvalCode.trim().toUpperCase()) {
        return NextResponse.json({
          success: false,
          limitExceeded: true,
          invalidCode: true,
          restrictionMessage: user.restrictionMessage || "Approval Code is incorrect.",
          error: "Incorrect Approval Code. Please check your code and try again."
        }, { status: 403 });
      }

      // Valid approval code — log the bypass
      await prisma.auditLog.create({
        data: {
          adminId: 1,
          adminName: "Interzenex Security System",
          action: "TRANSFER_LIMIT_BYPASS",
          details: `User ${user.name} authorised a transfer beyond their ${user.transferCount}/day limit using an Approval Code (transfers today: ${todayCount + 1})`
        }
      });
    }

    // 3. Process Transaction
    // Deduct from sender, in the sender account's own currency
    await prisma.account.update({
      where: { id: senderAccount.id },
      data: { balance: { decrement: amountInAccCurrency } }
    });

    // Check if receiver account exists in our bank (Apex Bank)
    let receiverAccount = null;
    let receiverId = null;
    let convertedAmount = transAmount;
    let rate = 1.0;

    if (receiverBank.toLowerCase() === "interzenex microfinance" || receiverBank.toLowerCase() === "interzenex") {
      receiverAccount = await prisma.account.findUnique({
        where: { accountNumber: receiverAccountNumber }
      });

      if (receiverAccount) {
        receiverId = receiverAccount.userId;
        convertedAmount = convertCurrency(transAmount, currency, receiverAccount.currency);
        rate = Number((convertedAmount / transAmount).toFixed(4));

        // Credit receiver
        await prisma.account.update({
          where: { id: receiverAccount.id },
          data: { balance: { increment: convertedAmount } }
        });
      }
    }

    // Create transaction log
    const transaction = await prisma.transaction.create({
      data: {
        senderId: user.id,
        senderAccountNumber: senderAccount.accountNumber,
        senderName: user.name,
        receiverId,
        receiverAccountNumber,
        receiverBank,
        receiverName,
        amount: transAmount,
        currency,
        convertedAmount,
        conversionRate: rate,
        type: "TRANSFER",
        status: "COMPLETED",
        description: description || `Transfer to ${receiverName}`
      }
    });

    // Fetch updated sender account balance so the frontend can refresh immediately
    const updatedSenderAccount = await prisma.account.findUnique({
      where: { id: senderAccount.id }
    });

    const transfersLeft = limitActive
      ? Math.max(0, user.transferCount - (todayCount + 1))
      : null;

    return NextResponse.json({
      success: true,
      message: "Transfer completed successfully",
      transaction,
      transfersLeft,
      updatedAccount: updatedSenderAccount
    });
  } catch (error) {
    console.error("POST transaction error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
