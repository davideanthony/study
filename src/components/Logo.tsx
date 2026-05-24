import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, LOGO_VERSION } from "@/lib/constants";

export function Logo() {
  const src = `/logo1.png?v=${LOGO_VERSION}`;

  return (
    <Link
      href="/"
      className="relative block h-10 w-[10.5rem] shrink-0 transition hover:opacity-90 sm:h-11 sm:w-[12.5rem]"
      aria-label={SITE_NAME}
    >
      <Image
        src={src}
        alt=""
        width={352}
        height={80}
        unoptimized
        className="absolute left-0 top-1/2 h-[4.25rem] w-auto max-w-[12.5rem] -translate-y-1/2 object-contain object-left sm:h-[4.75rem] sm:max-w-[14.5rem]"
        priority
      />
    </Link>
  );
}
