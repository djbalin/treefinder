import Link from "next/link";

/** Adds the review queue to the admin navigation. */
export function ReviewNavLink() {
  return (
    <Link
      href="/admin/review"
      className="nav__link"
      style={{ display: "block", padding: "0.5rem 0" }}
    >
      Gennemgang
    </Link>
  );
}
