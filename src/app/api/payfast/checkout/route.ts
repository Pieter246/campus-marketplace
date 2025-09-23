import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID!;
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY!;
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE!;
const SANDBOX = true;

export async function POST(req: NextRequest) {
  try {
    const { cart } = await req.json(); // get static cart from frontend
    if (!cart || cart.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Dummy user for sandbox
    const user = {
      displayName: "Test User",
      email: "student@example.com",
    };

    // Calculate total
    let totalAmount = 0;
    const itemNames: string[] = [];
    cart.forEach((item: any) => {
      // Treat each unique item as quantity = 1
      totalAmount += Number(item.price || 0);
      itemNames.push(item.name);
    });

    const paymentData: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payfast/notify`,
      name_first: user.displayName,
      name_last: "",
      email_address: user.email,
      amount: totalAmount.toFixed(2),
      item_name: itemNames.join(", "),
      passphrase: PASSPHRASE,
    };

    const sorted = Object.keys(paymentData)
      .sort()
      .reduce((obj, key) => { obj[key] = paymentData[key]; return obj; }, {} as Record<string, string>);

    const queryString = qs.stringify(sorted, { encode: true });
    const payfastUrl = SANDBOX
      ? `https://sandbox.payfast.co.za/eng/process?${queryString}`
      : `https://www.payfast.co.za/eng/process?${queryString}`;

    return NextResponse.json({ url: payfastUrl });
  } catch (err) {
    console.error("PayFast checkout error:", err);
    return NextResponse.json({ message: "Failed to initiate PayFast", error: (err as Error).message }, { status: 500 });
  }
}
