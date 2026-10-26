import { notFound } from "next/navigation";

// Catches every unknown path inside a locale so it renders the localized
// not-found page instead of Next's default.
export default function CatchAllPage() {
  notFound();
}
