import Image from "next/image";

const LOGO_WIDTH = 2172;
const LOGO_HEIGHT = 724;

type LogoProps = {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

// Brand wordmark. The source PNG has a white background, so it sits in a
// white chip that blends on white/paper and reads as a clean badge on the
// orange header.
export function Logo({ className = "", imgClassName = "h-7", priority = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center rounded-lg bg-white px-2 py-1 ring-1 ring-black/5 ${className}`}>
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
