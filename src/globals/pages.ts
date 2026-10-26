import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "@/access";

function staticPage(
  slug: string,
  label: { da: string; en: string },
): GlobalConfig {
  return {
    slug,
    label,
    access: { read: anyone, update: isAdmin },
    versions: { max: 25 },
    fields: [
      {
        name: "title",
        type: "text",
        localized: true,
        required: true,
        label: { da: "Overskrift", en: "Title" },
      },
      {
        name: "content",
        type: "richText",
        localized: true,
        label: { da: "Indhold", en: "Content" },
      },
    ],
  };
}

/** "Where to get wood" page (product spec §8). */
export const WhereToGetWood = staticPage("whereToGetWood", {
  da: "Skaf træ",
  en: "Where to get wood",
});

/** About page with the food safety disclaimer and image credits. */
export const About = staticPage("about", { da: "Om", en: "About" });
