import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Sparkles, Zap, Trophy } from 'lucide-react';

export default function Hero() {
  return (
    <div className="text-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <motion.h1 
          className="text-6xl font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Portfolio{' '}
          <span className="text-matrix animate-matrix-flash">Gamified</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Discover my professional journey through unique NFTs. 
          Stake, earn tokens and unlock my experiences!
        </motion.p>
        
        <motion.div 
          className="flex justify-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="matrix-effect hover:matrix-glow transition-all duration-300">
            <ConnectButton />
          </div>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="card text-center matrix-effect hover:matrix-glow transition-all duration-300">
            <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collect NFTs</h3>
            <p className="text-gray-400">
              Each professional experience is represented by a unique NFT with its own rarity
            </p>
          </div>
          
          <div className="card text-center matrix-effect hover:matrix-glow transition-all duration-300">
            <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Stake & Earn</h3>
            <p className="text-gray-400">
              Stake your NFTs to generate tokens passively according to their rarity
            </p>
          </div>
          
          <div className="card text-center matrix-effect hover:matrix-glow transition-all duration-300">
            <Trophy className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Unlock Content</h3>
            <p className="text-gray-400">
              Use your tokens to unlock new experiences and interact with AI
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-16 glassmorphism rounded-2xl p-8 text-left max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-2xl font-bold mb-4 text-center">How does it work?</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="bg-green-600 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <p>Connect your wallet and claim your first free NFT</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-green-600 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <p>Stake your NFTs to generate tokens according to their rarity</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <p>Buy new NFTs and chat with AI about my experiences</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}