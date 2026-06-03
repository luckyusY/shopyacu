import Image from "next/image";

const LOGO_WIDTH = 1518;
const LOGO_HEIGHT = 420;

type LogoProps = {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

// Brand wordmark with transparent background so it can sit directly on header
// colors and page surfaces.
export function Logo({ className = "", imgClassName = "h-7", priority = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Shopyacu"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        sizes="(max-width:640px) 160px, 220px"
        className={`w-auto ${imgClassName}`}
      />
    </span>
  );
}
