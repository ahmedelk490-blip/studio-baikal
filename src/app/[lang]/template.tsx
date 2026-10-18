/* Page transition: a deep-water curtain lifts on every route change. */
import { ScrollTop } from "@/components/ScrollTop";
import { Parallax } from "@/components/Parallax";

export default function Template({ children }: { children: React.ReactNode }) {
  return <><ScrollTop />{children}<Parallax /><div aria-hidden className="page-curtain" /></>;
}