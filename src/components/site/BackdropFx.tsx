"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Parallax depth for the post-Hero environment. The cosmos haze and the
 * instrument ruling drift at different rates as the page scrolls, so moving down
 * the site feels like being pulled through one continuous space. Both layers are
 * heavily oversized and carry haze at every vertical band, so the atmosphere
 * never cuts off into flat black - it stays continuous from Origin through the
 * footer. Transform-only on fixed decorative layers; never affects layout.
 */
const HAZE =
  "radial-gradient(48% 16% at 80% 5%, color-mix(in oklab, var(--cosmos) 62%, transparent), transparent 60%)," +
  "radial-gradient(40% 14% at 8% 22%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 62%)," +
  "radial-gradient(54% 18% at 62% 44%, color-mix(in oklab, var(--cosmos) 46%, transparent), transparent 64%)," +
  "radial-gradient(46% 16% at 22% 66%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 62%)," +
  "radial-gradient(56% 18% at 72% 86%, color-mix(in oklab, var(--cosmos) 50%, transparent), transparent 66%)," +
  "radial-gradient(50% 16% at 32% 98%, color-mix(in oklab, var(--cosmos) 40%, transparent), transparent 64%)";

const RULING =
  "repeating-linear-gradient(90deg, rgba(233,235,238,0.05) 0px, rgba(233,235,238,0.05) 1px, transparent 1px, transparent 120px)";
const RULING_MASK = "radial-gradient(140% 60% at 50% 40%, #000 6%, transparent 76%)";

export function BackdropFx() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const spring = { stiffness: 50, damping: 26, mass: 0.7 };
  // different speeds = felt parallax depth between layers
  const hazeY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -260]), spring);
  const ruleY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -470]), spring);

  const layerCls = "absolute left-0 right-0 -top-[60%] h-[220%]";

  if (reduce) {
    return (
      <>
        <div className={layerCls} style={{ background: HAZE, opacity: 0.62 }} />
        <div
          className={layerCls}
          style={{ backgroundImage: RULING, WebkitMaskImage: RULING_MASK, maskImage: RULING_MASK, opacity: 0.5 }}
        />
      </>
    );
  }

  return (
    <>
      <motion.div style={{ y: hazeY }} className={layerCls}>
        <div className="absolute inset-0" style={{ background: HAZE, opacity: 0.62 }} />
      </motion.div>
      <motion.div style={{ y: ruleY }} className={layerCls}>
        <div
          className="absolute inset-0"
          style={{ backgroundImage: RULING, WebkitMaskImage: RULING_MASK, maskImage: RULING_MASK, opacity: 0.5 }}
        />
      </motion.div>
    </>
  );
}
