"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })); // clear error while typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Frontend validation first
    const newErrors: { [key: string]: string } = {};
    if (!form.email.includes("@")) newErrors.email = "Please enter a valid email address";
    if (!form.username || form.username.trim().length < 3)
      newErrors.username = "Username must be at least 3 characters";
    if (!form.password || form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful!");
        localStorage.setItem("access_token", data.access_token);
        router.push("/dashboard");
      } else {
        // ✅ Use API errors directly for inline display
        setErrors(data);
      }
    } catch (err) {
      console.error(err);
      setErrors({
        email: "An error occurred",
        username: "An error occurred",
        password: "An error occurred",
        confirmPassword: "An error occurred",
      });
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold">
          Create an account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Button type="submit" className="w-full mb-0" loading={loading}>
            Register
          </Button>

          <Button
            type="button"
            className="w-full mt-1"
            variant="outline"
            onClick={() => router.push("/login")}
          >
            Back
          </Button>
        </form>
      </div>
    </div>
  );
}
