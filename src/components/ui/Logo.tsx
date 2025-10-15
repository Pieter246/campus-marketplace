import Image from "next/image";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/logo.svg" // path relative to /public
      alt="Campus Marketplace Logo"
      className={className}
      width={150} // Adjust based on your logo's dimensions
      height={50} // Adjust based on your logo's dimensions
      unoptimized
    />
  );
}