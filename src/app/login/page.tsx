"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/Input";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const auth = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!form.email.includes("@")) newErrors.email = "Please enter a valid email address";
    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      await auth?.loginWithEmail(form.email, form.password);
      router.push("/");
    } catch (e: unknown) {
      const errorMessage: string =
        typeof e === "object" && e !== null && "code" in e && e.code === "auth/invalid-credential"
          ? "Incorrect credentials"
          : "An error occurred";
      toast.error("Error!", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Sign in with Google (returns Firebase User, not needed here)
      await auth.loginWithGoogle();

      // At this point, Firestore document is already created in loginWithGoogle
      toast.success("Success!", { description: "Logged in successfully" });

      // Refresh page to reflect logged-in state
      router.push("/");
      } catch (error: unknown) {
      // Handle user closing the popup
      const errorMessage: string =
        typeof error === "object" && error !== null && "code" in error && error.code === "auth/popup-closed-by-user"
          ? "You closed the popup before completing login."
          : typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
          ? error.message
          : "Google login failed";
      toast.error("Google login failed", { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const inputs = [
    { name: "email", type: "email", label: "Email" },
    { name: "password", type: "password", label: "Password" },
  ];

  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Logo className="h-42 w-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Login to your account</h2>
        <p className="text-gray-600 mb-6 text-center">Welcome back!</p>

        {errors.general && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {errors.general}
          </div>
        )}

        {/* Google Login Button */}
        <Button
          onClick={handleGoogleLogin}
          className="w-full mb-4 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          loading={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or login with email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {inputs.map((input) => (
            <Input
              key={input.name}
              type={input.type}
              name={input.name}
              id={input.name}
              value={form[input.name as keyof typeof form]}
              onChange={handleChange}
              disabled={loading}
              label={input.label}
              error={errors[input.name]}
            />
          ))}

          <Button type="submit" className="w-full" loading={loading}>
            Log In
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>

        <p className="text-center text-gray-600">
          Forgot password?{" "}
          <Link href="/reset-password" className="text-blue-600 hover:underline">
            Reset it
          </Link>
        </p>
      </div>
    </div>
  );
}