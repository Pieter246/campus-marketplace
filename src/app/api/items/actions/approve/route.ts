import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";
import { z } from "zod";

const ApproveSchema = z.object({
  itemId: z.string(),
  condition: z.enum(["new", "used", "fair", "poor"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ApproveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { itemId, condition } = parsed.data;

    await firestore.collection("items").doc(itemId).update({
      status: "for-sale",
      condition,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Item approved for sale",
    });
  } catch (error: any) {
    console.error("Approve error:", error);
    return NextResponse.json(
      { message: "Internal error", error: error.message },
      { status: 500 }
    );
  }
}
