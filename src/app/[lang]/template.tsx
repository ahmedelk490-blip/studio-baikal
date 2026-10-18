/* Page transition: a deep-water curtain lifts on every route change. */
import { ScrollTop } from "@/components/ScrollTop";
import { Curtain } from "@/components/Curtain";

export default function Template({ children }: { children: React.ReactNode }) {
  return <><ScrollTop />{children}<Curtain /></>;
}