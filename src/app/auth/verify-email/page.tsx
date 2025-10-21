"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

function VerifyEmailContent() {
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
      <h2 className="text-xl font-bold mb-4 text-center">Email Verification Required</h2>
      <p className="text-center mb-2">
        Your email is not verified. Please check your inbox and <b>click the verification link</b>.
      </p>
      <p className="text-center mb-4"> To <b>resend the verification email</b>, enter your password below and click the resend button.</p>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="mb-2 w-full px-3 py-2 border rounded"
      />
      <div className="relative mb-2">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-3 py-2 border rounded pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
          )}
        </button>
      </div>
      <Button
        onClick={handleResend}
        className="w-full"
        variant="primary"
        size="md"
        loading={sending}
        disabled={sending || !email || !password}
      >
        Resend Verification Email
      </Button>
      {/*<button
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
      </button>*/}
      {message && <p className="mt-4 text-red-800">{message}</p>}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
