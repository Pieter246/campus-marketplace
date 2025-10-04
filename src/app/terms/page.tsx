"use client";

import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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
          You must be a registered student with a valid university email address to use this service. 
          By creating an account, you confirm that the information you provide is accurate and truthful.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. User Responsibilities</h2>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li>You are responsible for your own listings, transactions, and communications with other users.</li>
          <li>Only legal and campus-approved items may be sold. Prohibited items include, but are not limited to:
            <ul className="list-circle list-inside ml-4 mt-2 space-y-1">
              <li>Alcohol, tobacco, or controlled substances</li>
              <li>Weapons, firearms, or dangerous materials</li>
              <li>Prescription drugs or medications</li>
              <li>Counterfeit or stolen goods</li>
              <li>Any items that violate university policies</li>
              <li>Hazardous materials</li>
            </ul>
          </li>
          <li>You must treat other users respectfully and avoid fraudulent, misleading, or harassing behavior.</li>
          <li>You are responsible for ensuring your listings are accurate and not misleading.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Transactions</h2>
        <p className="mb-4 text-gray-700">
          All transactions are conducted directly between students. The Campus
          Marketplace platform is not responsible for verifying payments,
          delivery, or quality of goods. We do not handle payments directly and
          are not party to any transactions between users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Dispute Resolution</h2>
        <p className="mb-4 text-gray-700">
          Users are encouraged to resolve disputes amicably between themselves. 
          If you encounter fraudulent activity or violations of these terms, you 
          may report the user to us at <a href="mailto:contact@campusmarketplace.com" className="text-blue-600 hover:underline">contact@campusmarketplace.com</a>. 
          We may, at our sole discretion, suspend accounts involved in repeated 
          or serious violations.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Account Management</h2>
        <p className="mb-4 text-gray-700">
          You may delete your account and associated data at any time by contacting 
          us at <a href="mailto:contact@campusmarketplace.com" className="text-blue-600 hover:underline">contact@campusmarketplace.com</a>. 
          Upon account deletion, your active listings will be removed and your 
          personal data will be processed in accordance with our Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Liability</h2>
        <p className="mb-4 text-gray-700">
          The Campus Marketplace is provided "as is." We are not liable for any 
          disputes, losses, or damages resulting from use of the platform. As a 
          neutral platform, we do not endorse any items listed and are not responsible 
          for the accuracy of listings or the conduct of users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes to Terms</h2>
        <p className="mb-4 text-gray-700">
          These terms may be updated periodically. Continued use of the platform
          indicates acceptance of the updated terms. We will notify users of 
          material changes via email or platform notification.
        </p>

        <p className="mt-8 text-gray-700">
          By registering, you confirm that you have read, understood, and agreed to these
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