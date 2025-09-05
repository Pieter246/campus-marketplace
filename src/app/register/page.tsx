"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
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

      // 4. Store token and redirect
      toast.success("Registration successful!");
      localStorage.setItem("access_token", idToken);
      
      // Force auth state update
      window.dispatchEvent(new Event('storage'));
      router.push("/dashboard");
      
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
      
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const inputs = [
    { name: "email", type: "email", label: "Email" },
    { name: "username", type: "text", label: "Username" },
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