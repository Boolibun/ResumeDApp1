import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glassmorphism border-b border-white/10"
    >
      <div className="w-full px-6 py-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center matrix-glow">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold text-matrix animate-matrix-flash">Portfolio DApp</span>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <ConnectButton />
        </div>
      </div>
    </motion.nav>
  );
}