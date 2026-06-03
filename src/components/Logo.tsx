import Image from "next/image";

const LOGO_WIDTH = 1518;
const LOGO_HEIGHT = 420;

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
    <span className={`inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-black/5 ${className}`}>
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
