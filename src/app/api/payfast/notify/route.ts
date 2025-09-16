import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  // PayFast fields
  const merchant_id = formData.get("merchant_id");
  const pf_payment_id = formData.get("pf_payment_id");
  const amount_gross = formData.get("amount_gross");
  const payment_status = formData.get("payment_status");

  console.log("PayFast notification received:", {
    merchant_id,
    pf_payment_id,
    amount_gross,
    payment_status,
  });

  // TODO: verify signature using MERCHANT_KEY & PASSPHRASE
  // Update Firebase order status here

  return new NextResponse("OK"); // Must return 200
}
