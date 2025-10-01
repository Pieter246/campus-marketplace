import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/firebase/server";
import { firestore } from "@/firebase/server";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get stats from database
    const [usersSnap, itemsSnap, purchasesSnap] = await Promise.all([
      firestore.collection("users").get(),
      firestore.collection("items").get(),
      firestore.collection("purchases").get()
    ]);

    const totalUsers = usersSnap.size;
    const totalItems = itemsSnap.size;
    const totalSales = purchasesSnap.size;
    
    // Calculate revenue
    let revenue = 0;
    purchasesSnap.docs.forEach(doc => {
      const purchase = doc.data();
      revenue += Number(purchase.itemPrice || 0);
    });

    return NextResponse.json({
      totalUsers,
      totalItems,
      totalSales,
      revenue: revenue.toFixed(2)
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}