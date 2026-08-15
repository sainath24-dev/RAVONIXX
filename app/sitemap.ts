import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ravonixx.xyz";
  const routes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/team", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/strategy", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/esports", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/policy", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return routes.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}

