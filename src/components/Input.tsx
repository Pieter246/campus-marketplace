import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      <input
        {...props}
        placeholder=" "
        className={cn(
          `peer w-full border-b-2 bg-transparent py-3 px-1 text-gray-900 focus:outline-none transition-colors`,
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500",
          className
        )}
      />
      <label
        htmlFor={props.id || props.name}
        className={cn(
          `absolute left-1 text-base text-gray-400 cursor-text transition-all duration-300
           peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
           peer-focus:-top-1 peer-focus:text-sm peer-focus:text-blue-500`
        )}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
