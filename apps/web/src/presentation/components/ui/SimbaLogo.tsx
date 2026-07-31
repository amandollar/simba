export function SimbaLogo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/simba-logo.png"
      alt="Simba AI"
      width={size}
      height={size}
      className={`rounded-lg object-cover ${className}`}
    />
  );
}
