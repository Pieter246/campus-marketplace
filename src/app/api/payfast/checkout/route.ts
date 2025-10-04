import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { authenticateRequest } from "@/firebase/server";

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID!;
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY!;
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE!;
const SANDBOX = true;

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cart } = await req.json(); // get static cart from frontend
    if (!cart || cart.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Calculate total
    let totalAmount = 0;
    const itemNames: string[] = [];
    cart.forEach((item: { id: string; name: string; price: number; quantity?: number }) => {
      const quantity = item.quantity || 1;
      totalAmount += Number(item.price || 0) * quantity;
      itemNames.push(`${item.name} (x${quantity})`);
    });

    const paymentData: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payfast/notify`,
      name_first: user.userData?.firstName || user.userData?.displayName || "Student",
      name_last: user.userData?.lastName || "",
      email_address: user.email || "student@example.com",
      amount: totalAmount.toFixed(2),
      item_name: itemNames.join(", "),
      custom_str1: user.uid, // Pass user ID for cart cleanup
      passphrase: PASSPHRASE,
    };

    const sorted = Object.keys(paymentData)
      .sort()
      .reduce((obj, key) => { obj[key] = paymentData[key]; return obj; }, {} as Record<string, string>);

    console.log("=== PAYFAST CHECKOUT - SIGNATURE DEBUG ===");
    console.log("Original payment data:", paymentData);
    console.log("Sorted payment data:", sorted);
    
    const queryString = qs.stringify(sorted, { encode: true });
    console.log("Generated query string:", queryString);
    
    const payfastUrl = SANDBOX
      ? `https://sandbox.payfast.co.za/eng/process?${queryString}`
      : `https://www.payfast.co.za/eng/process?${queryString}`;
      
    console.log("Final PayFast URL:", payfastUrl);
    console.log("=== END PAYFAST CHECKOUT DEBUG ===");

    return NextResponse.json({ url: payfastUrl });
  } catch (err) {
    console.error("PayFast checkout error:", err);
    return NextResponse.json({ message: "Failed to initiate PayFast", error: (err as Error).message }, { status: 500 });
  }
}
