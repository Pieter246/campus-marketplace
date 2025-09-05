"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!form.email.includes("@")) newErrors.email = "Please enter a valid email address";
    if (!form.username || form.username.trim().length < 3)
      newErrors.username = "Username must be at least 3 characters";
    if (!form.password || form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!form.terms) newErrors.terms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    
    try {
      // 1. Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        form.email, 
        form.password
      );
      const user = userCredential.user;
      
      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // 3. Sync user with Firestore database
      const syncResponse = await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: form.username, // Use the username as display name
          emailVerified: user.emailVerified,
          photoURL: null
        }),
      });

      if (!syncResponse.ok) {
        throw new Error("Failed to sync user data");
      }

      // Success! Firebase Auth handles token storage automatically
      
      // Redirect to home page (consistent with login)
      router.push("/");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "Registration failed";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Registration
  const handleGoogleRegister = async () => {
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Sync user with Firestore database
      const syncResponse = await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName, // Google provides display name
          emailVerified: user.emailVerified,
          photoURL: user.photoURL
        }),
      });

      if (!syncResponse.ok) {
        throw new Error("Failed to sync user data");
      }

      // Success! Firebase Auth handles token storage automatically
      
      // Redirect to home page (consistent with login)
      router.push("/");
      
    } catch (error: any) {
      console.error("Google registration error:", error);
      
      // Handle specific errors
      let errorMessage = "Google registration failed";
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "Account already exists with different login method";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup blocked. Please allow popups and try again";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Registration cancelled";
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const inputs = [
    { name: "email", type: "email", label: "Email" },
    { name: "password", type: "password", label: "Password" },
    { name: "confirmPassword", type: "password", label: "Confirm Password" },
  ];

  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <div className="flex justify-center mb-4">
          <Logo className="h-42 w-auto" />
        </div>
        <h1 className="mb-6 text-center text-2xl font-semibold">
          Create an account
        </h1>
        
        {errors.general && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {errors.general}
          </div>
        )}

        {/* Google Registration Button */}
        <Button 
          onClick={handleGoogleRegister}
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
            <span className="px-2 bg-white text-gray-500">Or register with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {inputs.map((input) => (
            <Input
              key={input.name}
              type={input.type}
              name={input.name}
              id={input.name}
              value={form[input.name as keyof typeof form] as string}
              onChange={handleChange}
              disabled={loading}
              label={input.label}
              error={errors[input.name]}
            />
          ))}

          {/* Terms & Conditions checkbox */}
          <div className="flex items-start mb-0">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 mb-0 text-sm text-red-500">{errors.terms}</p>
          )}

          <Button type="submit" className="w-full mb-0 mt-4" loading={loading}>
            Register
          </Button>

          <Button
            type="button"
            className="w-full mt-1"
            variant="secondary"
            onClick={() => router.push("/login")}
          >
            Back to Login
          </Button>
        </form>
      </div>
    </div>
  );
}