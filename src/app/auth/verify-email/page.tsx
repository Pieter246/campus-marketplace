"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleResend = async () => {
    setSending(true);
    setMessage("");
    try {
      const { signInWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth");
      const { auth: clientAuth } = await import("@/firebase/client");
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const user = userCredential.user;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        setMessage("Verification email sent! Please check your inbox and spam folder.");
      } else {
        setMessage("Your email is already verified or user not found.");
      }
      await clientAuth.signOut();
    } catch (err) {
      setMessage("Failed to resend verification email. Please check your password and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Email Verification Required</h2>
      <p className="mb-4">
        Your email is not verified. Please check your inbox and click the verification link.<br />
        <span className="text-blue-700">To resend the verification email, enter your password below and click the resend button.</span>
      </p>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="mb-2 w-full px-3 py-2 border rounded"
      />
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Enter your password"
        className="mb-2 w-full px-3 py-2 border rounded"
      />
      <button
        type="button"
        className="mb-4 text-blue-600 underline"
        onClick={() => setShowPassword((v) => !v)}
      >
        {showPassword ? "Hide" : "Show"} Password
      </button>
      <button
        onClick={handleResend}
        disabled={sending || !email || !password}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {sending ? "Sending..." : "Resend Verification Email"}
      </button>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
