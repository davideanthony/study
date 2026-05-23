const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(raw: string): { ok: true; username: string } | { ok: false; error: string } {
  const username = normalizeUsername(raw);

  if (!username) {
    return { ok: false, error: "Scegli un username." };
  }
  if (username.length < 3) {
    return { ok: false, error: "L'username deve avere almeno 3 caratteri." };
  }
  if (username.length > 24) {
    return { ok: false, error: "L'username può avere al massimo 24 caratteri." };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      error: "Usa solo lettere minuscole, numeri e underscore (es. mario_rossi).",
    };
  }

  return { ok: true, username };
}
