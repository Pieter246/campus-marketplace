import { NextRequest, NextResponse } from "next/server";
import md5 from "crypto-js/md5";
import qs from "qs";

const PASSPHRASE = process.env.PAYFAST_PASSPHRASE!;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const pfData: Record<string, any> = Object.fromEntries(formData.entries());

  console.log("PayFast notification received:", pfData);

  const receivedSignature = pfData.signature as string;
  delete pfData.signature;

  // Create a string by concatenating the name/value pairs (excluding the signature)
  const queryString = qs.stringify(pfData, { encode: false });

  // Append the passphrase
  const stringToHash = `${queryString}&passphrase=${PASSPHRASE}`;

  const generatedSignature = md5(stringToHash).toString();

  // Log signature verification details
  console.log("--- PayFast Notify Signature Verification ---");
  console.log("Received Signature:", receivedSignature);
  console.log("Generated Signature for verification:", generatedSignature);
  console.log("-----------------------------------------");

  if (generatedSignature === receivedSignature) {
    console.log("Signature valid. Payment notification is authentic.");
    // TODO: Update Firebase order status here
    const { pf_payment_id, payment_status } = pfData;
    console.log(
      `Successfully processed payment ${pf_payment_id} with status ${payment_status}`,
    );
    // Perform actions based on payment_status (e.g., 'COMPLETE', 'FAILED')
  } else {
    console.error("Signature verification failed. Notification may be fraudulent.");
    return new NextResponse("Signature verification failed", { status: 400 });
  }

  return new NextResponse("OK"); // Must return 200
}
