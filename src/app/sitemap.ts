import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().origin;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/cerca`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/termini`, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const supabase = await createClient();
    const { data: notes } = await supabase
      .from("notes")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    const noteRoutes: MetadataRoute.Sitemap = (notes ?? []).map((n) => ({
      url: `${base}/appunti/${n.id}`,
      lastModified: n.created_at,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...noteRoutes];
  } catch {
    return staticRoutes;
  }
}
