"use client";

import Button from "@/components/ui/Button";

export default function ButtonShowcase() {
  type ButtonVariant = "primary" | "secondary" | "outline";
    type ButtonSize = "sm" | "md" | "lg";

    const variants: ButtonVariant[] = ["primary", "secondary", "outline"];
    const sizes: ButtonSize[] = ["sm", "md", "lg"];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Button Showcase</h1>

      {variants.map((variant) => (
        <div key={variant} className="space-y-4">
          <h2 className="text-xl font-semibold capitalize">{variant} buttons</h2>
          <div className="flex flex-wrap gap-4">
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {`${variant} ${size}`}
              </Button>
            ))}
            {/* Example of a loading button */}
            <Button variant={variant} size="md" loading>
              {`${variant} loading`}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
