import { NextRequest, NextResponse } from "next/server";
import md5 from "crypto-js/md5";

const PASSPHRASE = process.env.PAYFAST_PASSPHRASE!;

/**
 * PayFast ITN signature rules (per official docs & working legacy examples):
 * 1. Use ALL fields exactly as POSTed (including empty values), EXCEPT 'signature'.
 * 2. Preserve the ORIGINAL ORDER received (do NOT sort) – order matters if merchant added custom fields.
 * 3. Values must be URL encoded AS ORIGINALLY SENT (so we must NOT decode + re-encode differently).
 * 4. Concatenate as name=value pairs joined by '&'.
 * 5. If a passphrase is set, append: &passphrase=YourPassphrase (passphrase value URL encoded ONLY if it contains special chars – we leave it raw unless needed).
 * 6. MD5 hash the final string – must match the received 'signature'.
 */

export async function POST(req: NextRequest) {
  // Read raw body so we can preserve parameter order & original encoding
  const rawBody = await req.text();
  console.log("Raw PayFast body:", rawBody);

  // Extract signature (can appear anywhere). We'll remove only that pair.
  // Match signature parameter (start, middle, or end)
  const signatureMatch = rawBody.match(/(?:^|&)signature=([^&]*)/);
  const receivedSignature = signatureMatch ? decodeURIComponent(signatureMatch[1]) : undefined;
  if (!receivedSignature) {
    console.error("No signature field found in ITN payload");
    return new NextResponse("Missing signature", { status: 400 });
  }

  // Remove the signature pair from the raw string while keeping other pairs & their order/encoding intact
  let baseParamString = rawBody
    // remove signature=... (with preceding & if not first)
    .replace(/(^|&)signature=[^&]*/,'')
    // clean possible leading & left after removal
    .replace(/^&/, '')
    // trim whitespace just in case
    .trim();

  // IMPORTANT: Do NOT drop empty values – PayFast includes them in signature calc
  // At this point baseParamString is the exact concatenation of all remaining pairs.

  // Append passphrase if configured (non-empty)
  let stringToHash = baseParamString;
  if (PASSPHRASE && PASSPHRASE.length > 0) {
    // Append with & (only if there are existing params)
    stringToHash += `&passphrase=${PASSPHRASE}`; // leave as-is; encode if you add special chars
  }

  const generatedSignature = md5(stringToHash).toString();

  // Additionally parse into object for business logic
  const params = new URLSearchParams(rawBody);
  const pfData: Record<string,string> = {};
  params.forEach((value, key) => { pfData[key] = value; });

  console.log("--- PayFast Notify Signature Verification ---");
  console.log("Base param string (without signature):", baseParamString);
  console.log("String to hash (final):", stringToHash);
  console.log("Received Signature:", receivedSignature);
  console.log("Generated Signature:", generatedSignature);
  console.log("All received fields (raw order preserved):", pfData);
  console.log("-----------------------------------------");

  if (generatedSignature !== receivedSignature) {
    // For PayFast ITN you normally MUST still return 200 to stop retries; keeping 400 for debug only.
    console.error("Signature mismatch – investigate. Returning 400 (debug mode).\nSuggestion: once fixed, always return 200 even on mismatch to avoid repeated retries flooding logs.");
    return new NextResponse("Signature verification failed", { status: 400 });
  }

  console.log("Signature valid. Proceeding with payment handling.");

  // Example: extract useful fields
  const { pf_payment_id, payment_status, amount_gross, m_payment_id } = pfData;
  console.log("Payment info:", { pf_payment_id, payment_status, amount_gross, m_payment_id });

  // TODO: (idempotent) persist / update order state in Firestore here
  // Ensure you guard against replay attacks: store pf_payment_id processed list.

  return new NextResponse("OK");
}
