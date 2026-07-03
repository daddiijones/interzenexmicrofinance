import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { issueOtp } from '@/lib/otp';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Please enter email and password." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json({
        success: false,
        error: "Your account has been suspended. Please contact customer administration."
      }, { status: 403 });
    }

    if (user.status === "REJECTED") {
      return NextResponse.json({
        success: false,
        error: "Your account application was not approved. Please contact support if you believe this is a mistake."
      }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid credentials." }, { status: 401 });
    }

    // Credentials are valid — issue a one-time code instead of logging in directly.
    const { cooldown } = await issueOtp(user);

    return NextResponse.json({
      success: true,
      otpRequired: true,
      message: "Verification code sent to your email",
      userId: user.id,
      email: user.email,
      cooldown
    });
  } catch (error) {
    console.error("Login error: ", error);
    return NextResponse.json({ success: false, error: "An error occurred during login." }, { status: 500 });
  }
}
