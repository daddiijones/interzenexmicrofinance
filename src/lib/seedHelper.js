import prisma from './db';

const BANKS = ["Chase Bank", "Bank of America", "Wells Fargo", "CitiBank", "TD Bank", "Barclays", "HSBC"];
const NAMES = ["Alice Smith", "Robert Johnson", "Emily Davis", "David Miller", "Jessica Taylor", "James Anderson", "Maria Garcia", "Chris Wilson"];

// ─── Transaction pools ────────────────────────────────────────────────────────

const TRANSFERS_OUT = [
  { desc: "Wire Transfer to Alice Smith",    min: 200,  max: 1500 },
  { desc: "Payment to Robert Johnson",       min: 100,  max: 600  },
  { desc: "Rent Payment",                    min: 800,  max: 2000 },
  { desc: "Business Payment",               min: 300,  max: 1200 },
  { desc: "Freelance Invoice Payment",       min: 150,  max: 800  },
  { desc: "Wire Transfer to David Miller",   min: 50,   max: 400  },
  { desc: "International Wire Transfer",     min: 500,  max: 3000 },
];

const DEPOSITS = [
  { desc: "Interzenex Corp Salary Direct Deposit", min: 2500, max: 5000 },
  { desc: "Interzenex Corp Payroll",               min: 2000, max: 4500 },
  { desc: "Transfer from Savings",           min: 200,  max: 800  },
  { desc: "Venmo Payment Received",          min: 20,   max: 250  },
  { desc: "Bank Transfer Received",          min: 100,  max: 600  },
  { desc: "Cash Deposit",                    min: 50,   max: 500  },
  { desc: "Dividend Payout",                 min: 10,   max: 150  },
  { desc: "Tax Refund",                      min: 200,  max: 1200 },
  { desc: "Freelance Payment Received",      min: 300,  max: 1500 },
];

const WITHDRAWALS = [
  { desc: "ATM Withdrawal — Main St",        min: 20,   max: 200  },
  { desc: "ATM Cash Withdrawal",             min: 40,   max: 300  },
  { desc: "ATM Withdrawal — Airport",        min: 50,   max: 200  },
  { desc: "Cash Withdrawal",                 min: 100,  max: 500  },
  { desc: "ATM Withdrawal — Downtown",       min: 20,   max: 150  },
];

const BILLS = [
  { desc: "Electric Utility Bill",           min: 65,   max: 150  },
  { desc: "Internet & Cable Service",        min: 50,   max: 120  },
  { desc: "Water & Sewage Bill",             min: 30,   max: 80   },
  { desc: "Netflix Subscription",            min: 15,   max: 23   },
  { desc: "Spotify Premium",                 min: 10,   max: 15   },
  { desc: "Phone Bill",                      min: 45,   max: 100  },
  { desc: "Health Insurance Premium",        min: 120,  max: 350  },
  { desc: "Amazon Prime Subscription",       min: 14,   max: 16   },
  { desc: "Gas & Electricity",               min: 80,   max: 200  },
  { desc: "Gym Membership",                  min: 25,   max: 60   },
];

const CARD_SPENDS = [
  { desc: "Starbucks Coffee",                min: 4,    max: 15   },
  { desc: "McDonald's",                      min: 8,    max: 25   },
  { desc: "Amazon Purchase",                 min: 15,   max: 200  },
  { desc: "Uber Trip",                       min: 10,   max: 45   },
  { desc: "Whole Foods Grocery",             min: 40,   max: 180  },
  { desc: "Target Stores",                   min: 12,   max: 120  },
  { desc: "Chevron Gas Station",             min: 30,   max: 70   },
  { desc: "Apple App Store",                 min: 1,    max: 30   },
  { desc: "Chipotle Mexican Grill",          min: 10,   max: 22   },
  { desc: "Walgreens Pharmacy",              min: 15,   max: 80   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPastDate(daysAgo, offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(8 + Math.floor(Math.random() * 13) + offset);
  d.setMinutes(Math.floor(Math.random() * 60));
  d.setSeconds(Math.floor(Math.random() * 60));
  return d;
}

function makeReceiver() {
  return {
    bank: pick(BANKS),
    name: pick(NAMES),
    acct: generateAccountNumber(),
  };
}

export function generateAccountNumber() {
  let num = "";
  for (let i = 0; i < 10; i++) num += Math.floor(Math.random() * 10).toString();
  return num;
}

export function generateApprovalCode() {
  return "APR-" + Math.floor(1000 + Math.random() * 9000).toString();
}

// ─── Main seeder ─────────────────────────────────────────────────────────────

export async function seedUserTransactions(userId, userEmail, userName, baseCurrency = "USD") {
  // 1. Create accounts
  const existing = await prisma.account.findMany({ where: { userId } });

  let checkingAcc, savingsAcc;

  if (existing.length === 0) {
    checkingAcc = await prisma.account.create({
      data: { userId, type: "CHECKING",   accountNumber: generateAccountNumber(), currency: baseCurrency, balance: 8000 }
    });
    savingsAcc = await prisma.account.create({
      data: { userId, type: "SAVINGS",    accountNumber: generateAccountNumber(), currency: baseCurrency, balance: 15200 }
    });
    await prisma.account.create({
      data: { userId, type: "INVESTMENT", accountNumber: generateAccountNumber(), currency: baseCurrency, balance: 2450 }
    });
  } else {
    checkingAcc = existing.find(a => a.type === "CHECKING");
    savingsAcc  = existing.find(a => a.type === "SAVINGS");
  }

  // 2. Create a debit card
  const existingCards = await prisma.card.findMany({ where: { userId } });
  if (existingCards.length === 0) {
    await prisma.card.create({
      data: {
        userId,
        cardNumber:     "4532" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join(""),
        cardholderName: userName.toUpperCase(),
        expiryDate:     "12/29",
        cvv:            Math.floor(100 + Math.random() * 900).toString(),
        cardType:       "DEBIT",
        status:         "ACTIVE"
      }
    });
  }

  // 3. Build a guaranteed, realistic transaction history
  // We'll schedule across the last 60 days, then sort chronologically
  const txns = [];

  // ── DEPOSITS (6) ────────────────────────────────────────────────────────────
  // Two salary deposits roughly 2 weeks apart
  [56, 28, 14].forEach((daysAgo, i) => {
    const tpl = DEPOSITS[i === 0 || i === 2 ? 0 : 1]; // salary
    txns.push({
      senderId: null, senderAccountNumber: null, senderName: "Direct Deposit",
      receiverId: userId,
      receiverAccountNumber: checkingAcc.accountNumber,
      receiverBank: "Interzenex Microfinance", receiverName: userName,
      amount: rand(tpl.min, tpl.max), currency: baseCurrency,
      convertedAmount: 0, conversionRate: 1.0,
      type: "DEPOSIT", status: "COMPLETED",
      description: tpl.desc, createdAt: getPastDate(daysAgo),
    });
  });
  // Three misc deposits
  [45, 33, 7].forEach(daysAgo => {
    const tpl = pick(DEPOSITS.slice(2));
    txns.push({
      senderId: null, senderAccountNumber: null, senderName: "External",
      receiverId: userId,
      receiverAccountNumber: checkingAcc.accountNumber,
      receiverBank: "Interzenex Microfinance", receiverName: userName,
      amount: rand(tpl.min, tpl.max), currency: baseCurrency,
      convertedAmount: 0, conversionRate: 1.0,
      type: "DEPOSIT", status: "COMPLETED",
      description: tpl.desc, createdAt: getPastDate(daysAgo, 2),
    });
  });

  // ── TRANSFERS (6) ───────────────────────────────────────────────────────────
  [52, 40, 30, 18, 9, 3].forEach(daysAgo => {
    const tpl = pick(TRANSFERS_OUT);
    const rx = makeReceiver();
    txns.push({
      senderId: userId,
      senderAccountNumber: checkingAcc.accountNumber,
      senderName: userName,
      receiverId: null,
      receiverAccountNumber: rx.acct,
      receiverBank: rx.bank, receiverName: rx.name,
      amount: rand(tpl.min, tpl.max), currency: baseCurrency,
      convertedAmount: 0, conversionRate: 1.0,
      type: "TRANSFER", status: "COMPLETED",
      description: tpl.desc, createdAt: getPastDate(daysAgo),
    });
  });

  // ── WITHDRAWALS (5) ─────────────────────────────────────────────────────────
  [50, 38, 25, 13, 4].forEach(daysAgo => {
    const tpl = pick(WITHDRAWALS);
    txns.push({
      senderId: userId,
      senderAccountNumber: checkingAcc.accountNumber,
      senderName: userName,
      receiverId: null,
      receiverAccountNumber: generateAccountNumber(),
      receiverBank: "ATM Network", receiverName: "Cash Withdrawal",
      amount: rand(tpl.min, tpl.max), currency: baseCurrency,
      convertedAmount: 0, conversionRate: 1.0,
      type: "WITHDRAWAL", status: "COMPLETED",
      description: tpl.desc, createdAt: getPastDate(daysAgo, 1),
    });
  });

  // ── BILLS (6) ───────────────────────────────────────────────────────────────
  [55, 42, 35, 22, 11, 5].forEach(daysAgo => {
    const tpl = pick(BILLS);
    txns.push({
      senderId: userId,
      senderAccountNumber: checkingAcc.accountNumber,
      senderName: userName,
      receiverId: null,
      receiverAccountNumber: generateAccountNumber(),
      receiverBank: "Payment Processor", receiverName: tpl.desc,
      amount: rand(tpl.min, tpl.max), currency: baseCurrency,
      convertedAmount: 0, conversionRate: 1.0,
      type: "BILL_PAY", status: "COMPLETED",
      description: tpl.desc, createdAt: getPastDate(daysAgo, 3),
    });
  });

  // ── CARD SPENDS (6) ─────────────────────────────────────────────────────────
  [48, 36, 26, 16, 8, 2].forEach(daysAgo => {
    const tpl = pick(CARD_SPENDS);
    txns.push({
      senderId: userId,
      senderAccountNumber: checkingAcc.accountNumber,
      senderName: userName,
      receiverId: null,
      receiverAccountNumber: generateAccountNumber(),
      receiverBank: "Card Network", receiverName: tpl.desc,
      amount: rand(tpl.min, tpl.max), currency: baseCurrency,
      convertedAmount: 0, conversionRate: 1.0,
      type: "CARD_SPEND", status: "COMPLETED",
      description: tpl.desc, createdAt: getPastDate(daysAgo, 2),
    });
  });

  // Sort oldest → newest, then assign convertedAmount = amount (same currency seed)
  txns.sort((a, b) => a.createdAt - b.createdAt);
  for (const t of txns) t.convertedAmount = t.amount;

  // 4. Save transactions
  for (const t of txns) {
    await prisma.transaction.create({ data: t });
  }

  // 5. Simulate balance: start from a known anchor and apply debits
  //    (We set generous opening balances so the final balance is always positive)
  let checkingBal = 8000;
  for (const t of txns) {
    if (t.receiverAccountNumber === checkingAcc.accountNumber) {
      checkingBal += t.amount; // credit
    } else if (t.senderAccountNumber === checkingAcc.accountNumber) {
      checkingBal -= t.amount; // debit
    }
  }

  await prisma.account.update({
    where: { id: checkingAcc.id },
    data: { balance: Math.max(checkingBal, 500) }
  });
  // Savings untouched by these seeded transactions
  await prisma.account.update({
    where: { id: savingsAcc.id },
    data: { balance: 15200 }
  });
}
