import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, LOGO_VERSION } from "@/lib/constants";

export function Logo() {
  const src = `/logo1.png?v=${LOGO_VERSION}`;

  return (
    <Link
      href="/"
      className="flex shrink-0 items-center transition hover:opacity-90"
      aria-label={SITE_NAME}
    >
      <Image
        src={src}
        alt=""
        width={352}
        height={80}
        unoptimized
        className="h-10 w-auto max-w-[9.5rem] object-contain object-left sm:h-11 sm:max-w-[11.5rem]"
        priority
      />
    </Link>
  );
}
