import { Magnetic } from "./Magnetic";

/* Button with a rolling label and an arrow disc that turns on hover; magnetic on fine pointers. */
export function Btn({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" | "dark" }) {
  return (
    <Magnetic>
      <a href={href} className={`btn btn-${variant}`}>
        <span className="btn-roll"><span>{children}</span><span aria-hidden>{children}</span></span>
        <span className="btn-ico" aria-hidden />
      </a>
    </Magnetic>
  );
}