"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getAuth, User } from "firebase/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

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
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user: User = userCredential.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Optional: Send token to backend to sync user (if needed)
      // await fetch("/api/auth/sync-user", { method: "POST", headers: { Authorization: `Bearer ${idToken}` } });

      // Redirect to items page
      router.push("/displayItems");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors({ general: error.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user: User = userCredential.user;

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Optional: Send token to backend to sync user
      // await fetch("/api/auth/sync-user", { method: "POST", headers: { Authorization: `Bearer ${idToken}` } });

      router.push("/displayItems");
    } catch (error: any) {
      console.error("Google login error:", error);
      setErrors({ general: error.message || "Google login failed" });
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

        {/* Google Login */}
        <Button
          onClick={handleGoogleLogin}
          className="w-full mb-4 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          loading={loading}
        >
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
          Don't have an account?{" "}
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
