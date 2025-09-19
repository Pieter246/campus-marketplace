interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return(
    <img
      src="/logo.svg" // path relative to /public
      alt="Campus Marketplace Logo"
      className={className}
    />
  );
}