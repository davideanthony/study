import { test, expect } from "@playwright/test";

test("homepage mostra titolo e ricerca", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Trova appunti/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Cerca per titolo/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Cerca/i }).first()).toBeVisible();
});

test("pagina cerca è raggiungibile", async ({ page }) => {
  await page.goto("/cerca");
  await expect(page.getByRole("heading", { name: /Cerca appunti/i })).toBeVisible();
});
