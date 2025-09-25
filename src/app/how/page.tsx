"use client";

import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HowItWorksPage() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">How It Works</h1>

        <p className="mb-4 text-gray-700">
          Campus Marketplace is a simple platform for students to buy and sell items on campus.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Create an Account</h2>
        <p className="mb-4 text-gray-700">
          Sign up with your student account to start buying and selling. Your account allows you to manage listings and purchases safely.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. List Your Item</h2>
        <p className="mb-4 text-gray-700">
          You can create a listing for free. If you're not ready, save it as a draft and complete it later.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Connect with Buyers</h2>
        <p className="mb-4 text-gray-700">
          When someone decides to buy your item, they put it in their cart and checkout. Once they've successfully completed payment, we'll hold the money for the safety of both buyer and seller until the deal is concluded (more about that later). The buyer will be put in touch with the seller to arrange the sale offline. Communicate with your buyer to coordinate pick-up or delivery.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Complete the Sale</h2>
        <p className="mb-4 text-gray-700">
          Once the buyer collects the item, both the seller and buyer must take a photo together with the item. This ensures a safe and verified transaction.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Mark as Sold</h2>
        <p className="mb-4 text-gray-700">
          The buyer will mark the item as sold in the Purchases tab of their Profile. Once marked sold, the buyer receives their payment and everyone can move forward happily.
        </p>

        <p className="mt-8 text-gray-700">
          That’s it! Campus Marketplace makes it easy to list, sell, and buy items safely within the student community.
        </p>

        <div className="mt-8 flex gap-4">
        <Button asChild variant="primary" size="md" className="flex-1">
            <Link href="/">Marketplace</Link>
        </Button>
        <Button asChild variant="secondary" size="md" className="flex-1">
            <Link href="/profile">My Profile</Link>
        </Button>
        </div>

      </div>
    </div>
  );
}
