import { useState } from 'react';
import { motion } from 'framer-motion';
import NFTCollection from './NFTCollection';
import StakingInterface from './StakingInterface';
import Marketplace from './Marketplace';
import Timeline from './Timeline';
import Chatbot from './Chatbot';
import ClaimSection from './ClaimSection';
import DashboardHome from './DashboardHome';
import Faucet from './Faucet';
import { Wallet, Coins, ShoppingBag, Clock, MessageCircle, LayoutDashboard, Droplets } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'collection', name: 'My NFTs', icon: Wallet },
    { id: 'staking', name: 'Staking', icon: Coins },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag },
    { id: 'faucet', name: 'Faucet', icon: Droplets },
    { id: 'timeline', name: 'Timeline', icon: Clock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'collection':
        return <NFTCollection />;
      case 'staking':
        return <StakingInterface />;
      case 'marketplace':
        return <Marketplace />;
      case 'faucet':
        return <Faucet />;
      case 'timeline':
        return <Timeline />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 glassmorphism border-r border-white/20 p-6 min-h-screen overflow-y-auto"
      >
        {/* Navigation */}
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.name}</span>
              </motion.button>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-xs text-gray-400 text-center">
            <p>Portfolio DApp v1.0</p>
            <p className="mt-1">Web3 Experience</p>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto p-6">
        {/* Claim Section */}
        <ClaimSection />
        
        {/* Page Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
        
        {/* Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
}