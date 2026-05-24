import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, LOGO_VERSION } from "@/lib/constants";

export function Logo() {
  const src = `/logo1.png?v=${LOGO_VERSION}`;

  return (
    <Link
      href="/"
      className="-my-2.5 flex shrink-0 items-center transition hover:opacity-90 sm:-my-3"
      aria-label={SITE_NAME}
    >
      <Image
        src={src}
        alt=""
        width={352}
        height={80}
        unoptimized
        className="h-[4rem] w-auto max-w-[min(14rem,54vw)] object-contain object-left sm:h-[4.25rem] sm:max-w-[15.5rem]"
        priority
      />
    </Link>
  );
}
