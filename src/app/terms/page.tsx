"use client";

import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    // Go back if possible, otherwise fallback to home page
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms & Conditions</h1>

        <p className="mb-4 text-gray-700">
          Welcome to the Campus Marketplace. By registering for an account and
          using this platform, you agree to the following terms and conditions.
          Please read them carefully before proceeding.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Purpose</h2>
        <p className="mb-4 text-gray-700">
          The Campus Marketplace is designed to help students buy and sell items,
          especially textbooks, directly with other students within the campus
          community.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Eligibility</h2>
        <p className="mb-4 text-gray-700">
          You must be a registered student to use this service. By creating an
          account, you confirm that the information you provide is accurate and
          truthful.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. User Responsibilities</h2>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li>You are responsible for your own listings and transactions.</li>
          <li>Only legal and campus-approved items may be sold.</li>
          <li>
            You must treat other users respectfully and avoid fraudulent or
            misleading behavior.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Transactions</h2>
        <p className="mb-4 text-gray-700">
          All transactions are conducted directly between students. The Campus
          Marketplace platform is not responsible for verifying payments,
          delivery, or quality of goods.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Liability</h2>
        <p className="mb-4 text-gray-700">
          The Campus Marketplace is provided “as is.” We are not liable for any
          disputes, losses, or damages resulting from use of the platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to Terms</h2>
        <p className="mb-4 text-gray-700">
          These terms may be updated periodically. Continued use of the platform
          indicates acceptance of the updated terms.
        </p>

        <p className="mt-8 text-gray-700">
          By registering, you confirm that you have read and agreed to these
          Terms & Conditions.
        </p>

        <div className="mt-8 text-center">
          <Button
            onClick={handleBack}
            className="w-full"
            variant="secondary"
            size="md"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
