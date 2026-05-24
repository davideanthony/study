"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/constants";

type MobileNavDrawerProps = {
  isLoggedIn: boolean;
  username: string | null;
  isAdmin: boolean;
};

type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  variant?: "default" | "accent" | "primary";
};

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-light/80 text-sage shadow-[var(--shadow-soft)]">
      {children}
    </span>
  );
}

export function MobileNavDrawer({ isLoggedIn, username, isAdmin }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  const items: NavItem[] = isLoggedIn
    ? [
        { href: "/cerca", label: "Cerca", description: "Appunti per corso e università", icon: <IconSearch /> },
        { href: "/carica", label: "Carica", description: "Pubblica un nuovo PDF", icon: <IconUpload /> },
        { href: "/messaggi", label: "Messaggi", description: "Le tue conversazioni", icon: <IconMessages /> },
        { href: "/salvati", label: "Salvati", description: "Appunti che hai messo cuore", icon: <IconBookmark /> },
        { href: "/notifiche", label: "Notifiche", description: "Aggiornamenti e attività", icon: <IconBell /> },
        {
          href: "/profilo",
          label: username ?? "Profilo",
          description: "Il tuo account",
          icon: <IconUser />,
          variant: "accent",
        },
        ...(isAdmin
          ? [{ href: "/admin", label: "Admin", description: "Pannello moderazione", icon: <IconShield /> }]
          : []),
      ]
    : [
        { href: "/cerca", label: "Cerca", description: "Esplora gli appunti", icon: <IconSearch /> },
        { href: "/auth/login", label: "Accedi", description: "Hai già un account?", icon: <IconLogin /> },
        {
          href: "/auth/signup",
          label: "Registrati",
          description: "Unisciti a STUFY",
          icon: <IconSparkle />,
          variant: "primary",
        },
      ];

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-light bg-surface text-sage shadow-[var(--shadow-soft)] transition hover:border-sage/40 hover:bg-mint-light/50"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label="Apri menu"
      >
        <HamburgerIcon open={false} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px] motion-safe:animate-[fadeIn_0.2s_ease-out]"
            aria-label="Chiudi menu"
            onClick={close}
          />

          <aside
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
            className="relative flex h-full w-[min(100%,20rem)] flex-col border-l border-gray-light bg-surface shadow-[var(--shadow-lift)] motion-safe:animate-[slideInRight_0.28s_cubic-bezier(0.22,1,0.36,1)]"
          >
            <div className="flex items-center justify-between border-b border-gray-light bg-gradient-to-br from-mint-light/60 to-surface px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sage">Menu</p>
                <p className="mt-0.5 text-lg font-bold text-foreground">{SITE_NAME}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-light bg-surface text-sage transition hover:bg-mint-light/60"
                aria-label="Chiudi menu"
              >
                <HamburgerIcon open />
              </button>
            </div>

            {isLoggedIn && username && (
              <div className="mx-4 mt-4 rounded-2xl border border-gray-light bg-mint-light/35 px-4 py-3">
                <p className="text-xs text-muted">Ciao,</p>
                <p className="truncate font-semibold text-sage-dark">@{username}</p>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={[
                        "flex items-center gap-3 rounded-2xl px-3 py-3 transition",
                        item.variant === "primary"
                          ? "bg-sage text-surface shadow-[var(--shadow-soft)] hover:bg-sage-dark"
                          : item.variant === "accent"
                            ? "border border-mint bg-mint-light/50 hover:bg-mint-light"
                            : "hover:bg-mint-light/40",
                      ].join(" ")}
                    >
                      <NavIcon>{item.icon}</NavIcon>
                      <span className="min-w-0 flex-1">
                        <span
                          className={[
                            "block truncate font-semibold",
                            item.variant === "primary" ? "text-surface" : "text-foreground",
                          ].join(" ")}
                        >
                          {item.label}
                        </span>
                        {item.description && (
                          <span
                            className={[
                              "mt-0.5 block truncate text-xs",
                              item.variant === "primary" ? "text-surface/85" : "text-muted",
                            ].join(" ")}
                          >
                            {item.description}
                          </span>
                        )}
                      </span>
                      <span
                        className={[
                          "text-lg leading-none",
                          item.variant === "primary" ? "text-surface/70" : "text-sage/50",
                        ].join(" ")}
                        aria-hidden
                      >
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-gray-light px-5 py-4">
              <p className="text-center text-xs text-muted">Appunti universitari, semplici.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M5 5 L15 15" />
          <path d="M15 5 L5 15" />
        </>
      ) : (
        <>
          <path d="M3 6 H17" />
          <path d="M3 10 H17" />
          <path d="M3 14 H17" />
        </>
      )}
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20 L16 16" strokeLinecap="round" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 16 V6 M8 10 L12 6 L16 10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18 H20" strokeLinecap="round" />
    </svg>
  );
}

function IconMessages() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M5 6 H19 A2 2 0 0 1 21 8 V14 A2 2 0 0 1 19 16 H9 L5 19 V6 Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 4 H18 V20 L12 16 L6 20 Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 4 A5 5 0 0 0 7 9 V11 L5 14 H19 L17 11 V9 A5 5 0 0 0 12 4 Z" strokeLinejoin="round" />
      <path d="M10 18 A2 2 0 0 0 14 18" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20 C5 16 8 14 12 14 S19 16 19 20" strokeLinecap="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3 L5 6 V11 C5 16 8 19 12 21 C16 19 19 16 19 11 V6 Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconLogin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 12 H20 M16 8 L20 12 L16 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 6 V18" strokeLinecap="round" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3 L13.5 9 L19 10.5 L13.5 12 L12 18 L10.5 12 L5 10.5 L10.5 9 Z" strokeLinejoin="round" />
    </svg>
  );
}
