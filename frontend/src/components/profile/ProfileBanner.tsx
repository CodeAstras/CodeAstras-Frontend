import { motion } from "motion/react";

export function ProfileBanner() {
    return (
        <div className="h-40 bg-[#0a0a0a] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/30 via-[#0ea5e9]/20 to-[#7c3aed]/30" />
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(124,58,237,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            {/* Stars animation */}
            <div className="absolute inset-0">
                {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{ opacity: Math.random() * 0.7 + 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                            duration: Math.random() * 2 + 2,
                            delay: Math.random() * 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
