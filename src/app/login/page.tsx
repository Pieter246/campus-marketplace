"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";

export default function LoginForm() {
  const router = useRouter();
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
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault() // prevent default form submission
    setError("")
    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        router.push("/");
      } else {
        setErrors(data);
      }
    } catch (err) {
      console.error(err);
      setErrors({ email: "An error occurred", password: "An error occurred" });
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
    {/*<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">*/}
    
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Logo className="h-42 w-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center">Login to your account</h2>
        <p className="text-gray-600 mb-6 text-center">Welcome back!</p>

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

        <div className="mt-6 text-center text-gray-500 text-sm">
          Demo User:<br />
          Email: user@example.com<br />
          Password: password12345
        </div>
      </div>
    </div>
  );
}
