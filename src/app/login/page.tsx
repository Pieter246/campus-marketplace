"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/displayItems");
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!form.email.includes("@")) newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/displayItems");
    } catch (err: any) {
      setErrors({ general: err.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/displayItems");
    } catch (err: any) {
      setErrors({ general: err.message || "Google login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4"><Logo className="h-42 w-auto" /></div>
        <h2 className="text-2xl font-bold mb-2 text-center">Login</h2>
        <p className="text-gray-600 mb-6 text-center">Welcome back!</p>

        {errors.general && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">{errors.general}</div>}

        <Button onClick={handleGoogleLogin} className="w-full mb-4 bg-red-600 hover:bg-red-700">Continue with Google</Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or login with email</span></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input name="email" type="email" label="Email" value={form.email} onChange={handleChange} disabled={loading} error={errors.email} />
          <Input name="password" type="password" label="Password" value={form.password} onChange={handleChange} disabled={loading} error={errors.password} />
          <Button type="submit" className="w-full" loading={loading}>Log In</Button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
        <p className="text-center text-gray-600">
          Forgot password? <Link href="/reset-password" className="text-blue-600 hover:underline">Reset</Link>
        </p>
      </div>
    </div>
  );
}
