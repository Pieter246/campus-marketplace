"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/Input";
import Logo from "@/components/ui/Logo";
import { registerUser, registerGoogleUser } from "./actions";
import { useAuth } from "@/context/auth";

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!form.firstName) newErrors.firstName = "First name is required";
    if (!form.lastName) newErrors.lastName = "Last name is required";
    if (!form.email.includes("@")) newErrors.email = "Invalid email";
    if (!form.password || form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!form.terms) newErrors.terms = "You must agree to terms";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await registerUser(
        form.email,
        form.password,
        form.firstName,
        form.lastName
      );

      if (response.error) {
        toast.error("Error", { description: response.message });
        return;
      }

      toast.success("Success", {
        description: "Your account was created successfully",
      });
      router.push("/login");
    } catch (err: unknown) {
      console.error(err);
      const error = err as { message?: string };
      toast.error("Registration failed", { description: error.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      // loginWithGoogle returns the signed-in Firebase User
      const user = await auth.loginWithGoogle();

      // Create Firestore doc for new Google user
      await registerGoogleUser({
        uid: user.uid,
        email: user.email!,
        emailVerified: user.emailVerified ?? false,
        displayName: user.displayName ?? "",
      });

      // Refresh so the app sees the user as logged in
      router.refresh();

      toast.success("Success!", { description: "Logged in successfully" });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        toast.error("Google login cancelled", {
          description: "You closed the popup before completing login.",
        });
      } else {
        console.error("Google registration error:", firebaseError);
        toast.error("Google login failed", { description: firebaseError.message || "" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <div className="flex justify-center mb-4">
          <Logo className="h-42 w-auto" />
        </div>
        <h1 className="mb-6 text-center text-2xl font-semibold">
          Create an account
        </h1>

        {/* Google Registration */}
        <Button
          onClick={handleGoogleRegister}
          className="w-full mb-4 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          loading={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Separator outside the form */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or register with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="First Name"
            name="firstName"
            id="firstName"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
            disabled={loading}
          />
          <Input
            label="Last Name"
            name="lastName"
            id="lastName"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
            disabled={loading}
          />
          <Input
            label="Email"
            name="email"
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
          />
          <Input
            label="Password"
            name="password"
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            disabled={loading}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={loading}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              className="mr-2"
            />
            <label>I agree to the <a className="text-blue-600 hover:text-blue-800 transition-colors duration-300" href="/terms">Terms & Conditions</a> and <a className="text-blue-600 hover:text-blue-800 transition-colors duration-300" href="/privacy">Privacy Policy</a></label>
          </div>
          {errors.terms && <p className="text-red-500">{errors.terms}</p>}

          <Button type="submit" loading={loading} className="w-full mb-1">
            Register
          </Button>

          <Button
            type="button"
            className="w-full"
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