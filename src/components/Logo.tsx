import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, LOGO_VERSION } from "@/lib/constants";

export function Logo() {
  const src = `/logo1.png?v=${LOGO_VERSION}`;

  return (
    <Link
      href="/"
      className="inline-flex items-center transition hover:opacity-90"
    >
      <Image
        src={src}
        alt={SITE_NAME}
        width={176}
        height={40}
        unoptimized
        className="h-9 w-auto max-w-[9.5rem] object-contain object-left sm:h-10 sm:max-w-[11rem]"
        priority
      />
    </Link>
  );
}
