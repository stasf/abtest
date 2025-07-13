import React from "react";
import { motion } from "framer-motion";

function Dot({ color = "grey", visible = true, faded = false }) {
  if (!visible) return null;
  const colorMap = {
    grey: "#888",
    red: "#f44",
    blue: "#4af",
  };
  return (
    <motion.div
      className="dot"
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{
        scale: 1,
        opacity: faded ? 0.3 : 1,
        filter: faded ? "grayscale(40%) blur(0.5px)" : "none"
      }}
      exit={{ scale: 0, opacity: 0 }}
      layout
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: colorMap[color],
        margin: 8,
        border: "2px solid #111",
        display: "inline-block",
        transition: "opacity 0.3s, filter 0.3s"
      }}
    />
  );
}

export default Dot;
