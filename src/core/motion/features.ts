// src/core/motion/features.ts
// domMax includes drag (needed by the drawer and popups). It is loaded lazily from main.tsx,
// so it stays out of the initial bundle.
import { domMax } from "framer-motion";
export default domMax;
