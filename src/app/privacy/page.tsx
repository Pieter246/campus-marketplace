"use client";

import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>

        <p className="mb-4 text-gray-700">
          Your privacy is important to us. This Privacy Policy explains how the
          Campus Marketplace collects, uses, and protects your personal
          information in compliance with the Protection of Personal Information Act (POPIA).
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li>Account information (name, student email address, and password)</li>
          <li>Listings you create (item details, descriptions, images, and prices)</li>
          <li>Transaction history and communication between users</li>
          <li>Technical data (IP address, browser type, and device information)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li>To provide and maintain the marketplace platform (necessary for contract performance)</li>
          <li>To verify your student status and eligibility</li>
          <li>To facilitate communication between buyers and sellers</li>
          <li>To ensure platform safety and prevent fraudulent activity</li>
          <li>To provide customer support and communicate important service updates</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Legal Basis for Processing</h2>
        <p className="mb-4 text-gray-700">
          We process your personal information primarily because it is necessary for 
          the performance of our contract with you (i.e., to provide the marketplace service). 
          For any optional marketing communications, we will seek your explicit consent separately.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Sharing Your Information</h2>
        <p className="mb-4 text-gray-700">
          We do not sell your personal information. Your information may be shared with:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li><strong>Other Users:</strong> As necessary to facilitate transactions (your name and contact information are shared with users you transact with)</li>
          <li><strong>Service Providers:</strong> Trusted third parties who help us operate our platform (hosting providers, email services) under strict confidentiality agreements</li>
          <li><strong>Legal Requirements:</strong> When required by South African law or to protect our rights and users' safety</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Security</h2>
        <p className="mb-4 text-gray-700">
          We implement reasonable technical and organizational measures to protect your 
          information from unauthorized access, alteration, disclosure, or destruction. 
          This includes SSL encryption, secure password hashing, and regular security reviews.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. International Data Transfers</h2>
        <p className="mb-4 text-gray-700">
          Your data may be processed on servers located outside South Africa. We ensure 
          that appropriate safeguards are in place to protect your data in accordance 
          with South African data protection laws.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Data Retention</h2>
        <p className="mb-4 text-gray-700">
          We retain your personal information only as long as necessary to fulfill the 
          purposes outlined in this policy, or as required by law. You may request 
          account deletion at any time, after which we will anonymize or delete your 
          personal data, retaining only what is legally required.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Your Rights Under POPIA</h2>
        <p className="mb-4 text-gray-700">
          You have the right to:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate or incomplete information</li>
          <li>Request deletion of your personal information (right to erasure)</li>
          <li>Object to the processing of your personal information</li>
          <li>Lodge a complaint with the Information Regulator of South Africa</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">9. Information Officer</h2>
        <p className="mb-4 text-gray-700">
          Our Information Officer can be contacted at:<br />
          <strong>Email:</strong> <a href="mailto:contact@campusmarketplace.com" className="text-blue-600 hover:underline">contact@campusmarketplace.com</a><br />
          Please use this address for all data protection inquiries, including requests to exercise your rights.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">10. Cookies & Tracking</h2>
        <p className="mb-4 text-gray-700">
          We use minimal technical cookies that are essential for platform functionality. 
          We do not use tracking cookies for advertising or analytics without your explicit consent.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">11. Changes to Privacy Policy</h2>
        <p className="mb-4 text-gray-700">
          This policy may be updated to reflect changes in our practices or legal requirements. 
          Continued use of the platform after changes constitutes acceptance of the updated policy.
        </p>

        <p className="mt-8 text-gray-700">
          By using the Campus Marketplace, you acknowledge that you have read and 
          understood this Privacy Policy and consent to the processing of your 
          personal information as described herein.
        </p>

        <div className="mt-8 text-center">
          <Button
            onClick={handleBack}
            variant="secondary"
            className="w-full"
            size="md"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}