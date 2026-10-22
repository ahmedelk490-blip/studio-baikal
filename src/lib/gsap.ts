import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// phones: the address bar showing/hiding resizes the page; re-measuring every pin then makes the scroll stutter
ScrollTrigger.config({ ignoreMobileResize: true });
export { gsap, ScrollTrigger, useGSAP };