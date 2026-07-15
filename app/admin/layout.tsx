import type { ReactNode } from "react";
import type { Metadata } from "next";

// Keep the admin view out of search engines. It's also password-gated and
// unlinked from the main site, so it's not discoverable or viewable there.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
