"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

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
            <div key={input.name} className="relative w-full">
              <input
                type={input.type}
                name={input.name}
                value={form[input.name as keyof typeof form]}
                onChange={handleChange}
                placeholder=" "
                id={input.name}
                disabled={loading}
                className={`peer w-full border-b-2 bg-transparent py-3 px-1 text-gray-900 focus:outline-none transition-colors
                  ${errors[input.name] ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-500"}`}
              />
              <label
                htmlFor={input.name}
                className={`absolute left-1 text-base text-gray-400 cursor-text transition-all duration-300
                  ${form[input.name as keyof typeof form] ? "-top-1 text-sm text-blue-500" : "top-3"}
                  peer-focus:-top-1 peer-focus:text-sm peer-focus:text-blue-500`}
              >
                {input.label}
              </label>
              {errors[input.name] && (
                <p className="mt-1 text-sm text-red-500">{errors[input.name]}</p>
              )}
            </div>
          ))}

          <Button type="submit" className="w-full" loading={loading}>
            REGISTER
          </Button>
        </form>
      </div>
    </div>
  );
}
