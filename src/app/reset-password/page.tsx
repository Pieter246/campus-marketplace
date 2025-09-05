"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })); // clear error while typing
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!form.email.includes("@")) newErrors.email = "Please enter a valid email address";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    // Simulate frontend-only behavior (API call would go here)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
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
            <p className="text-green-600 text-center font-medium">
              Instructions have been sent to your email.
            </p>
          )}
        </form>

        <div className="mt-2 text-center">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
