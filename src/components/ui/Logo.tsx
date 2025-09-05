import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string; // optional: make it clickable
}

export default function Logo({ className, href = "/" }: LogoProps) {
  const logoImage = (
    <img
      src="/logo.svg" // path relative to /public
      alt="Campus Marketplace Logo"
      className={className}
    />
  );

  return href ? <Link href={href}>{logoImage}</Link> : logoImage;
}