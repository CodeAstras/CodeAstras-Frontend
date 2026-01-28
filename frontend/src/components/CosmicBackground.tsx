import { motion } from "motion/react";

export function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Gradient base - simpler than images */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1f] via-[#0a0a0f] to-[#000000]" />
      
      {/* Subtle gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-transparent to-[#0a0a0f] opacity-50" />
      
      {/* Single animated light orb - CSS based */}
      <div
        className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.3) 0%, transparent 70%)',
          animation: 'floatOrb 12s ease-in-out infinite',
        }}
      />
      
      {/* Minimal floating particles - CSS animation */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-cyan-400 rounded-full opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-15, 15],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
