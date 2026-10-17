/* Page transition: a deep-water curtain lifts on every route change. */
import { ScrollTop } from "@/components/ScrollTop";

export default function Template({ children }: { children: React.ReactNode }) {
  return <><ScrollTop />{children}<div aria-hidden className="page-curtain" /></>;
}