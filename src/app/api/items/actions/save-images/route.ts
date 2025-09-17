import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, firestore } from "@/firebase/server";
import { z } from "zod";

// Zod schema for validation
const SaveImagesSchema = z.object({
  itemId: z.string(),
  images: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SaveImagesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { itemId, images } = parsed.data;

    console.log("Saving images for itemId:", itemId);

    await firestore.collection("items").doc(itemId).update({
      images,
    });

    return NextResponse.json({
      success: true,
      message: "Images saved successfully",
    });
  } catch (error: any) {
    console.error("Save images error:", error);
    return NextResponse.json(
      { message: "Internal error", error: error.message },
      { status: 500 }
    );
  }
}