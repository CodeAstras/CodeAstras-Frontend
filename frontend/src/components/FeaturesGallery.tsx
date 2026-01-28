import { motion } from "motion/react";
import {
  Users,
  Code,
  Zap,
  MessageSquare,
  GitBranch,
  Share2,
  Eye,
  Sparkles,
  Terminal,
  Lock,
  Globe,
  Layers
} from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Code,
    title: "Real-time Collaborative Editing",
    description: "Code together in perfect sync.",
    gradient: "from-cyan-400 to-blue-500",
    iconBg: "bg-cyan-500/20",
  },
  {
    icon: MessageSquare,
    title: "Built-in Voice Chat",
    description: "Crystal-clear team communication.",
    gradient: "from-purple-400 to-pink-500",
    iconBg: "bg-purple-500/20",
  },
  {
    icon: Layers,
    title: "Multi-file Workspace",
    description: "Organize projects with ease.",
    gradient: "from-emerald-400 to-cyan-500",
    iconBg: "bg-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Code Execution Sandbox",
    description: "Test and run instantly.",
    gradient: "from-orange-400 to-red-500",
    iconBg: "bg-orange-500/20",
  },
  {
    icon: GitBranch,
    title: "Version History",
    description: "Never lose your progress.",
    gradient: "from-blue-400 to-indigo-500",
    iconBg: "bg-blue-500/20",
  },
  {
    icon: Users,
    title: "Live Presence",
    description: "See who's coding where.",
    gradient: "from-pink-400 to-purple-500",
    iconBg: "bg-pink-500/20",
  },
];

const featuresRow2 = [
  {
    icon: Layers,
    title: "Room Collaboration",
    description: "Dedicated coding spaces.",
    gradient: "from-cyan-400 to-purple-500",
    iconBg: "bg-cyan-500/20",
  },
  {
    icon: Sparkles,
    title: "AI Assistance",
    description: "Smart code suggestions.",
    gradient: "from-yellow-400 to-orange-500",
    iconBg: "bg-yellow-500/20",
  },
  {
    icon: GitBranch,
    title: "Git Integration",
    description: "Seamless version control.",
    gradient: "from-green-400 to-emerald-500",
    iconBg: "bg-green-500/20",
  },
  {
    icon: Terminal,
    title: "Integrated Terminal",
    description: "Full command line access.",
    gradient: "from-indigo-400 to-blue-500",
    iconBg: "bg-indigo-500/20",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance.",
    gradient: "from-yellow-400 to-red-500",
    iconBg: "bg-yellow-500/20",
  },
  {
    icon: Globe,
    title: "Cloud Synced",
    description: "Access from anywhere.",
    gradient: "from-blue-400 to-cyan-500",
    iconBg: "bg-blue-500/20",
  },
];

export function FeaturesGallery() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section ref={ref} data-features-section className="relative py-12 md:py-16 lg:py-20 px-0 md:px-0 overflow-hidden">
      {/* Background gradient orbs - static */}
      <div
        className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/10 to-purple-500/10 blur-3xl -translate-y-1/2"
      />
      <div
        className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl -translate-y-1/2"
      />

      <div className="relative z-10">
        {/* Section Title - no animations */}
        <div className="text-center mb-12 md:mb-16 px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl xl:text-5xl mb-3 md:mb-4">
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-400 to-purple-600 opacity-15" />
              <span className="relative bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Superpowered Features
              </span>
            </span>
          </h2>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Everything you need to build, collaborate, and ship — turbocharged for modern teams
          </p>
        </div>

        {/* First row - scrolling left to right */}
        <div className="relative mb-6 md:mb-8">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

          {/* Scrolling track */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4 md:gap-6"
              animate={{
                x: [0, -1500],
              }}
              transition={{
                x: {
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate features for seamless loop */}
              {[...features, ...features, ...features].map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Second row - scrolling right to left */}
        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

          {/* Scrolling track */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4 md:gap-6"
              animate={{
                x: [-1500, 0],
              }}
              transition={{
                x: {
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate features for seamless loop */}
              {[...featuresRow2, ...featuresRow2, ...featuresRow2].map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  return (
    <div className="relative group min-w-[360px] md:min-w-[400px] h-[320px] md:h-[360px] flex-shrink-0">
      {/* Glass card */}
      <div
        className="relative h-full p-7 md:p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 group-hover:border-white/30 transition-all duration-300 overflow-hidden flex flex-col"
      >
        {/* Icon */}
        <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl ${feature.iconBg} backdrop-blur-xl border border-white/20 flex items-center justify-center mb-5 flex-shrink-0`}>
          <feature.icon className={`w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="relative space-y-4 flex-grow flex flex-col">
          <h3 className="text-lg md:text-xl font-semibold tracking-tight line-clamp-2">
            {feature.title}
          </h3>
          <p className="text-base md:text-base text-gray-400 leading-relaxed flex-grow font-normal">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}