import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { convertCurrency } from '@/lib/currencies';

const VALID_STATUSES = ["COMPLETED", "PENDING", "REJECTED"];

// PATCH: admin changes a transaction's status. Since transfers move money
// the instant they're created (there's no separate "settlement" step in
// this app), moving a transfer in or out of COMPLETED has to actually
// reverse or re-apply the balance change — otherwise the ledger and the
// account balances drift apart. Only TRANSFER affects two accounts; other
// transaction types are only ever seeded historical data, not something a
// live user flow creates, so they're just relabeled.
export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const txId = parseInt(params.id);
    const { adminId, status } = await request.json();

    if (!adminId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }
    const admin = await prisma.user.findUnique({ where: { id: parseInt(adminId) } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden access" }, { status: 403 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: "Status must be COMPLETED, PENDING, or REJECTED." }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({ where: { id: txId } });
    if (!tx) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    const wasCompleted = tx.status === "COMPLETED";
    const willBeCompleted = status === "COMPLETED";

    if (tx.type === "TRANSFER" && wasCompleted !== willBeCompleted) {
      const senderAccount = tx.senderAccountNumber
        ? await prisma.account.findUnique({ where: { accountNumber: tx.senderAccountNumber } })
        : null;
      const receiverAccount = await prisma.account.findUnique({ where: { accountNumber: tx.receiverAccountNumber } }).catch(() => null);

      if (willBeCompleted) {
        // Re-applying: debit sender, credit receiver (if internal)
        if (senderAccount) {
          const amountInSenderCurrency = convertCurrency(tx.amount, tx.currency, senderAccount.currency);
          if (senderAccount.balance < amountInSenderCurrency) {
            return NextResponse.json({
              success: false,
              error: `Cannot re-complete this transfer — sender's balance is insufficient to re-apply $${amountInSenderCurrency.toFixed(2)}.`
            }, { status: 400 });
          }
          await prisma.account.update({
            where: { id: senderAccount.id },
            data: { balance: { decrement: amountInSenderCurrency } }
          });
        }
        if (receiverAccount && tx.receiverId) {
          await prisma.account.update({
            where: { id: receiverAccount.id },
            data: { balance: { increment: tx.convertedAmount } }
          });
        }
      } else {
        // Reversing: credit sender back, debit receiver back (if internal)
        if (senderAccount) {
          const amountInSenderCurrency = convertCurrency(tx.amount, tx.currency, senderAccount.currency);
          await prisma.account.update({
            where: { id: senderAccount.id },
            data: { balance: { increment: amountInSenderCurrency } }
          });
        }
        if (receiverAccount && tx.receiverId) {
          await prisma.account.update({
            where: { id: receiverAccount.id },
            data: { balance: { decrement: tx.convertedAmount } }
          });
        }
      }
    }

    const updated = await prisma.transaction.update({
      where: { id: txId },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name,
        action: "TRANSACTION_STATUS_CHANGE",
        details: `Changed transaction #${txId} (${tx.type}, ${tx.receiverName}) status from ${tx.status} to ${status}`
      }
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    console.error("PATCH admin transaction error: ", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
