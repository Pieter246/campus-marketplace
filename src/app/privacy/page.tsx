// app/privacy/page.tsx
"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>

        <p className="mb-4 text-gray-700">
          Your privacy is important to us. This Privacy Policy explains how the
          Campus Marketplace collects, uses, and protects your personal
          information when you use our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li>Account information such as name, email, and password.</li>
          <li>Listings you create, including item details and images.</li>
          <li>Transaction history and interactions with other users.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li>To provide and maintain the platform.</li>
          <li>To communicate with you regarding your account and transactions.</li>
          <li>To improve our services and ensure platform safety.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
        <p className="mb-4 text-gray-700">
          We do not sell your personal information. Information may be shared
          with other users only as necessary to facilitate transactions (e.g.,
          your contact information is visible to buyers and sellers).
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
        <p className="mb-4 text-gray-700">
          We take reasonable measures to protect your information from
          unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Cookies & Tracking</h2>
        <p className="mb-4 text-gray-700">
          We may use cookies and similar technologies to enhance your
          experience, analyze usage, and improve our services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to Privacy Policy</h2>
        <p className="mb-4 text-gray-700">
          This policy may be updated from time to time. Continued use of the
          platform constitutes acceptance of any changes.
        </p>

        <p className="mt-8 text-gray-700">
          By using the Campus Marketplace, you agree to the terms of this Privacy Policy.
        </p>

        <div className="mt-8 text-center">
            <Button
                onClick={() => window.location.href = "/register"}
                variant="secondary"
                size="md"
            >
                Back to Register
            </Button>
        </div>
      </div>
    </div>
  );
}
