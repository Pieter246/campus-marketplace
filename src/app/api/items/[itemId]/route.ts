// src/app/api/items/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { firestore, authenticateRequest } from "@/firebase/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// 🔧 Zod schema for updates
const UpdateItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  category: z.enum(["books", "electronics", "clothing"]),
  condition: z.enum(["new", "used", "fair", "poor"]),
  itemStatus: z.enum(["available", "sold", "reserved", "inactive"]),
  collectionAddress: z.string().min(1),
});

type ItemData = {
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  itemStatus: string;
  collectionAddress: string;
  postedAt?: Timestamp;
  updatedAt?: Timestamp;
  images?: string[];
};

//Extract item
function extractItemId(req: NextRequest): string | null {
  const segments = req.nextUrl.pathname
    .replace(/\/$/, "") // remove trailing slash
    .split("/");

  const itemId = segments.at(-1); // more readable than segments[segments.length - 1]
  return itemId || null;
}

// Get item
export async function GET(req: NextRequest) {
  try {
    const itemId = extractItemId(req);
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }

    const itemDoc = await firestore.collection("items").doc(itemId).get();
    if (!itemDoc.exists) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    const itemData = itemDoc.data() as ItemData;

    return NextResponse.json({
      success: true,
      item: {
        id: itemDoc.id,
        ...itemData,
        postedAt: itemData.postedAt?.toDate?.()?.toISOString(),
        updatedAt: itemData.updatedAt?.toDate?.()?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Get item error:", error);
    return NextResponse.json(
      {
        message: "Failed to get item",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ✏️ PUT update item
export async function PUT(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const itemId = extractItemId(req);
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }

    const raw = await req.json();
    const parsed = UpdateItemSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const itemRef = firestore.collection("items").doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    const itemData = itemDoc.data() as ItemData;
    if (itemData.sellerId !== user.uid) {
      return NextResponse.json(
        { message: "Forbidden: You can only edit your own items" },
        { status: 403 }
      );
    }

    const updateData = {
      ...parsed.data,
      updatedAt: Timestamp.now(),
    };

    await itemRef.update(updateData);

    console.log(`Item updated: ${itemId}`);
    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      updatedFields: Object.keys(parsed.data),
    });
  } catch (error: any) {
    console.error("Item update error:", error);
    return NextResponse.json(
      {
        message: "Failed to update item",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE item
export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const itemId = extractItemId(req);
    if (!itemId) {
      return NextResponse.json({ message: "Missing itemId" }, { status: 400 });
    }

    const itemRef = firestore.collection("items").doc(itemId);
    const itemDoc = await itemRef.get();
    if (!itemDoc.exists) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    const itemData = itemDoc.data() as ItemData;
    if (itemData.sellerId !== user.uid) {
      return NextResponse.json(
        { message: "Forbidden: You can only delete your own items" },
        { status: 403 }
      );
    }

    await itemRef.delete();

    console.log(`Item deleted: ${itemId}`);
    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
      itemId,
    });
  } catch (error: any) {
    console.error("Item deletion error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete item",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
