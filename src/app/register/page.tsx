"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    university: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("You must agree to terms and privacy policy");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-black">StudentMarket</h1>
          <p className="text-gray-600">Join StudentMarket</p>
          <p className="text-gray-500 text-sm">Create your account to start trading</p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-black">
          <input name="fullName" placeholder="Full name" value={form.fullName} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
          <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
          <input name="university" placeholder="University" value={form.university} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
          <input name="studentId" placeholder="Student ID" value={form.studentId} onChange={handleChange} required className="w-full rounded border px-3 py-2" />

          {/* Password */}
          <div className="relative">
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-gray-600">
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2 text-gray-600">
              {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Agreements */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
            <span className="text-sm">I agree to the <Link href="/terms" className="text-blue-600">terms and conditions</Link></span>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
            <span className="text-sm">I agree to the <Link href="/privacy" className="text-blue-600">privacy policy</Link></span>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-black">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
