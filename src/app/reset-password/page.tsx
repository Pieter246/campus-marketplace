"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!form.email.includes("@")) newErrors.email = "Please enter a valid email address";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      // 1. Send password reset email using Firebase Auth
      await sendPasswordResetEmail(auth, form.email);
      
      // 2. Show success message
      setSuccess(true);
      
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      
      // Handle specific Firebase errors
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/user-not-found') {
        setErrors({ email: "No account found with this email address" });
      } else if (firebaseError.code === 'auth/invalid-email') {
        setErrors({ email: "Invalid email address" });
      } else {
        setErrors({ email: "Failed to send reset email. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputs = [
    { name: "email", type: "email", label: "Email Address" },
  ];

  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Reset Password</h2>
        <p className="text-gray-600 mb-6 text-center">
          Enter your email address and we will send you instructions to reset your password.
        </p>

        {errors.general && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          {inputs.map((input) => (
            <Input
              key={input.name}
              type={input.type}
              name={input.name}
              id={input.name}
              value={form[input.name as keyof typeof form]}
              onChange={handleChange}
              disabled={loading || success}
              label={input.label}
              error={errors[input.name]}
            />
          ))}

          {!success && (
            <Button type="submit" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 px-4 py-3 mb-4 rounded-lg text-center">
              <p className="font-medium">Password reset instructions sent!</p>
              <p className="text-sm mt-1">
                If <strong>{form.email}</strong> is registered, check your email for password reset instructions.
              </p>
            </div>
          )}
        </form>

        <div className="mt-1 text-center">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Back to Login
          </Button>
        </div>

        {/* Security note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            For security, password reset links are sent to your email and expire after a short time.
          </p>
        </div>
      </div>
    </div>
  );
}