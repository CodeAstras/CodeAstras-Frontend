import { motion } from "motion/react";
import { CosmicStars } from '../components/workspace/CosmicStars';
import { ArrowRight, Users, Code2, Zap, Target, Sparkles, Heart } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
            {/* Cosmic Background */}
            <CosmicStars />

            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Navigation Header */}
            <header className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0f]/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <a href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center">
                                    <Code2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] blur-md opacity-50" />
                            </div>
                            <span className="text-xl font-semibold bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] bg-clip-text text-transparent">
                                CodeAstras
                            </span>
                        </a>

                        {/* Nav Links */}
                        <nav className="flex items-center gap-6">
                            <a href="/" className="text-sm text-white/60 hover:text-white transition-colors">
                                Home
                            </a>
                            <a href="/about" className="text-sm text-white font-medium">
                                About
                            </a>
                            <a
                                href="/signup"
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                Get Started
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                {/* Hero Section - Beyond the Interview */}
                <section className="relative py-20 md:py-32 overflow-hidden">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="text-center space-y-8"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Heading */}
                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold">
                                    Beyond the{" "}
                                    <span className="relative inline-block">
                                        <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-purple-400 to-cyan-400 opacity-30" />
                                        <span className="relative bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                            Interview
                                        </span>
                                    </span>
                                </h1>
                            </div>

                            {/* Quote */}
                            <motion.div
                                className="max-w-4xl mx-auto space-y-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                                    Great engineers aren't defined by memorized answers.
                                </p>
                                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                                    They are defined by how they <span className="text-white font-medium">think</span>, <span className="text-purple-400 font-medium">collaborate</span>, and <span className="text-cyan-400 font-medium">solve problems</span>.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* About CodeAstras Section */}
                <section className="relative py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                About CodeAstras
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                                At CodeAstras, we believe great engineers are not defined by memorized answers or isolated coding tasks — they're defined by how they think, collaborate, and solve problems in real time.
                            </p>
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                                That belief is what led us to build CodeAstras.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Our Story Section */}
                <section className="relative py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-purple-400">
                                Our Story
                            </h2>

                            <div className="space-y-6">
                                <p className="text-lg text-gray-300 leading-relaxed">
                                    CodeAstras was created to solve a simple but persistent problem:{" "}
                                    <span className="text-white font-medium">technical interviews and collaborative coding rarely reflect real engineering work.</span>
                                </p>
                                <p className="text-lg text-gray-300 leading-relaxed">
                                    Most platforms either test candidates in isolation or provide collaboration tools that lack execution safety and realism. As engineers ourselves, we wanted a system that mirrors how teams actually work — discussing ideas, writing code together, debugging, and making decisions under real constraints.
                                </p>
                                <p className="text-lg text-cyan-400 italic font-medium">
                                    CodeAstras was born from that need.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Who We Serve Section */}
                <section className="relative py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400">
                                Who We Serve
                            </h2>

                            <p className="text-lg text-gray-300">
                                CodeAstras is built for:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: Users, text: "Engineering teams conducting technical interviews" },
                                    { icon: Target, text: "Interviewers who want to evaluate real problem-solving, not rehearsed answers" },
                                    { icon: Code2, text: "Developers who want a fair, collaborative interview experience" },
                                    { icon: Sparkles, text: "Educators and mentors running live coding sessions" }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-start gap-4 p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                    >
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
                                            <item.icon className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">{item.text}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-lg text-white font-medium pt-4">
                                If your work involves evaluating or collaborating with developers, CodeAstras is designed for you.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* What Makes Us Different Section */}
                <section className="relative py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                What Makes CodeAstras Different
                            </h2>

                            <p className="text-lg text-gray-300">
                                We focus on what matters most during real technical collaboration:
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Real-time collaboration", desc: "code together, not alone" },
                                    { title: "Live, isolated code execution", desc: "safe and controlled environments" },
                                    { title: "Session-based workflows", desc: "temporary rooms, no setup friction" },
                                    { title: "Engineering-first design", desc: "performance, clarity, and reliability over gimmicks" }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 backdrop-blur-sm"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                    >
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-400">— {item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-lg text-cyan-400 font-medium pt-4">
                                Instead of optimizing for flash, we optimize for signal.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Our Mission Section */}
                <section className="relative py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 border border-purple-500/20 backdrop-blur-xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-6">
                                Our Mission
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
                                Our mission is to make technical collaboration more authentic, fair, and effective — whether it's an interview, a mentoring session, or a team problem-solving exercise.
                            </p>
                            <p className="text-lg md:text-xl text-white font-medium">
                                We want teams to spend less time managing tools and more time understanding how engineers think.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* The People Behind Section */}
                <section className="relative py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 flex items-center gap-3">
                                <Heart className="w-8 h-8" />
                                The People Behind CodeAstras
                            </h2>

                            <p className="text-lg text-gray-300 leading-relaxed">
                                CodeAstras is built by engineers who care deeply about clean systems, thoughtful design, and real-world usability. We're actively building, testing, and improving the platform based on hands-on experience and honest feedback.
                            </p>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                As an early-stage product, we value transparency, iteration, and technical rigor over marketing claims.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Where We Are Today Section */}
                <section className="relative py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-purple-400">
                                Where We Are Today
                            </h2>

                            <p className="text-lg text-gray-300">
                                CodeAstras is currently in active development and early use. We're focused on:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { icon: Zap, text: "Shipping reliable features" },
                                    { icon: Users, text: "Learning from real users" },
                                    { icon: Sparkles, text: "Improving the collaboration experience step by step" }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center space-y-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                    >
                                        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
                                            <item.icon className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <p className="text-gray-300">{item.text}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-lg text-gray-300 pt-4">
                                Every feature is built with long-term scalability and security in mind.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Why Choose CodeAstras Section */}
                <section className="relative py-16 md:py-24">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Why Choose CodeAstras?
                            </h2>

                            <p className="text-lg text-gray-300">
                                Choose CodeAstras if you want:
                            </p>

                            <div className="space-y-4">
                                {[
                                    "A collaboration experience that feels real",
                                    "Interviews that reflect actual engineering work",
                                    "A platform built with care, not shortcuts",
                                    "A team that listens and iterates quickly"
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                    >
                                        <div className="shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400" />
                                        <p className="text-lg text-gray-300">{item}</p>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="text-lg text-white font-medium pt-4">
                                We're not trying to replace how engineers think — we're trying to support it.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="relative py-20 md:py-32">
                    <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-32">
                        <motion.div
                            className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-cyan-500/20 border border-purple-500/30 backdrop-blur-xl text-center space-y-8"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                                Ready to Collaborate?
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Whether you're conducting interviews, running collaborative sessions, or exploring better ways to work together, we'd love for you to try CodeAstras.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <a
                                    href="/signup"
                                    className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] text-white font-medium text-lg hover:opacity-90 transition-all flex items-center gap-2"
                                >
                                    Start a Session
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <a
                                    href="/"
                                    className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-lg hover:bg-white/20 transition-all backdrop-blur-sm"
                                >
                                    Learn More
                                </a>
                            </div>
                            <p className="text-gray-400 text-lg pt-4">
                                Collaborate live. See the difference.
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-400">
                            © 2025 CodeAstras. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
