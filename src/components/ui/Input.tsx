import * as React from "react"

import { cn } from "@/lib/utils";
import { useFormField } from "./form";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, className, ...props }: InputProps) {
  const { error } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  return (
    <div className="relative w-full mb-5">
      <input
        {...props}
        placeholder=" "
        className={cn(
          `peer w-full border-b-2 bg-transparent py-3 px-1 text-gray-900 
           focus:outline-none transition-colors`,
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500",
          className
        )}
      />
      <label
        htmlFor={props.id || props.name}
        className={cn(
          `absolute left-1 cursor-text transition-all duration-300
           text-gray-400
           peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
           peer-focus:-top-1 peer-focus:text-sm peer-focus:text-blue-500
           peer-not-placeholder-shown:-top-1 peer-not-placeholder-shown:text-sm`
        )}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{body}</p>}
    </div>
  );
}

export { Input }