/* Page transition: a deep-water curtain lifts on every route change. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}<div aria-hidden className="page-curtain" /></>;
}