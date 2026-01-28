import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/');
    window.location.reload();
  };

  const primaryNavItems = [
    { label: "Home", action: () => navigate('/') },
    { label: "Enterprise", action: () => { } },
    { label: "Pricing", action: () => navigate('/pricing') },
    { label: "Customers", action: () => { } },
  ];

  const secondaryNavItems = [
    { label: "About us", action: () => navigate('/about') },
    { label: "Careers", action: () => { } },
    { label: "Blog", action: () => { } },
    { label: "Contact", action: () => { } },
    { label: "Docs", action: () => { } },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/90 border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-bold text-lg flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent text-sm">
              CodeAstras
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-6 flex-1 justify-center px-8">
            {/* Primary Nav */}
            {primaryNavItems.map((item, idx) => (
              <motion.button
                key={item.label}
                onClick={item.action}
                className="text-sm text-gray-300 hover:text-white transition-colors duration-300 relative group whitespace-nowrap"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {item.label}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}

            {/* Divider */}
            <div className="h-5 w-px bg-white/10" />

            {/* Secondary Nav */}
            {secondaryNavItems.map((item, idx) => (
              <motion.button
                key={item.label}
                onClick={item.action}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-300 relative group whitespace-nowrap"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (4 + idx) * 0.05 }}
              >
                {item.label}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <motion.button
              onClick={() => navigate('/about')}
              className="hidden sm:block px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              About us
            </motion.button>
            <motion.button
              onClick={token ? handleLogout : () => navigate('/login')}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white border border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {token ? "Log Out" : "Login"}
            </motion.button>
            <motion.button
              onClick={() => navigate('/pricing')}
              className="hidden sm:block px-4 py-2 text-sm font-medium text-white border border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pricing
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          className="md:hidden mt-4 pt-4 border-t border-white/5"
          initial={false}
          animate={{ height: mobileMenuOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: "hidden" }}
        >
          <nav className="flex flex-col gap-3 pb-4">
            {[...primaryNavItems, ...secondaryNavItems].map((item) => (
              <motion.button
                key={item.label}
                onClick={() => {
                  item.action();
                  setMobileMenuOpen(false);
                }}
                className="text-left text-sm text-gray-300 hover:text-cyan-400 transition-colors duration-300 py-2"
                whileHover={{ x: 4 }}
              >
                {item.label}
              </motion.button>
            ))}
            <div className="flex gap-2 pt-4 border-t border-white/5 flex-col">
              <motion.button
                onClick={() => navigate('/about')}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
              >
                About us
              </motion.button>
              <motion.button
                onClick={() => {
                  token ? handleLogout() : navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white border border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-all"
                whileHover={{ scale: 1.02 }}
              >
                {token ? "Log Out" : "Login"}
              </motion.button>
              <motion.button
                onClick={() => {
                  navigate('/pricing');
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white border border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-all"
                whileHover={{ scale: 1.02 }}
              >
                Pricing
              </motion.button>
            </div>
          </nav>
        </motion.div>
      </div>
    </motion.header>
  );
}