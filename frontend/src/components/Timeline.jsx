import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount, useReadContract } from 'wagmi';
import { Calendar, MapPin, Award, Lock, Eye } from 'lucide-react';
import { CONTRACT_ADDRESSES, PORTFOLIO_NFT_ABI, NFT_DATA, RARITY_COLORS } from '../contracts';

export default function Timeline() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  
  // Get user's owned NFTs
  const { data: userOwnedNFTs } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
    abi: PORTFOLIO_NFT_ABI,
    functionName: 'getOwnedTokens',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Helper function to check if user owns a specific NFT
  const ownsNFT = (nftId) => {
    if (!userOwnedNFTs) return false;
    console.log('🔍 Checking NFT ownership:', { userOwnedNFTs, nftId });
    return userOwnedNFTs.some(ownedId => Number(ownedId) === nftId);
  };
  
  // Timeline data with dates
  const timelineData = [
    {
      id: 3,
      date: "April 2023 - January 2024",
      company: "Magibot",
      location: "Remote - Bangkok",
      nft: NFT_DATA[3],
      unlocked: ownsNFT(3), // Epic
    },
    {
      id: 2,
      date: "March 2025 - October 2025",
      company: "WeDriive",
      location: "Remote",
      nft: NFT_DATA[2],
      unlocked: ownsNFT(2), // Rare
    },
    {
      id: 1,
      date: "2020 - 2022",
      company: "Computer Engineering",
      location: "La Roche-sur-Foron (74), France",
      nft: NFT_DATA[1],
      unlocked: ownsNFT(1), // Common - free claim
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-matrix animate-matrix-flash">
          📈 Professional Journey
        </h2>
        <p className="text-lg text-gray-300">
          Discover my evolution through the years. Unlock NFTs to access full details!
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-emerald-500"></div>
        
        <div className="space-y-8">
          {timelineData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative flex items-start space-x-6"
            >
              {/* Timeline dot */}
              <div className={`relative z-10 w-4 h-4 rounded-full border-4 ${
                item.unlocked 
                  ? 'bg-green-500 border-green-300 shadow-lg shadow-green-500/50' 
                  : 'bg-gray-600 border-gray-400'
              }`}>
                {item.unlocked && (
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping"></div>
                )}
              </div>
              
              {/* Timeline content */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`flex-1 ${item.unlocked ? 'cursor-pointer' : ''}`}
              >
                <div className={`glassmorphism rounded-xl p-6 ${
                  item.unlocked 
                    ? `border-2 ${RARITY_COLORS[item.nft.rarity]} hover:shadow-glow` 
                    : 'opacity-60 border-gray-600'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-green-400">{item.date}</span>
                        {!item.unlocked && <Lock className="w-4 h-4 text-gray-400" />}
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-2 ${
                        item.unlocked ? 'text-white' : 'text-gray-500'
                      }`}>
                        {item.unlocked ? item.company : '████████████'}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {item.unlocked ? item.location : '████████'}
                        </span>
                      </div>
                    </div>
                    
                    {/* NFT Preview */}
                    <div className="ml-4">
                      <div className={`w-16 h-16 rounded-lg overflow-hidden ${
                        item.unlocked 
                          ? 'border-2 border-green-500' 
                          : 'bg-gray-700 flex items-center justify-center'
                      }`}>
                        {item.unlocked ? (
                          <img 
                            src={item.nft.image} 
                            alt={item.nft.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      
                      <div className="mt-2 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.unlocked
                            ? item.nft.rarity === 'Common' ? 'bg-gray-600' :
                              item.nft.rarity === 'Rare' ? 'bg-green-600' :
                              item.nft.rarity === 'Epic' ? 'bg-emerald-600' :
                              'bg-yellow-600'
                            : 'bg-gray-700 text-gray-500'
                        }`}>
                          {item.unlocked ? item.nft.rarity : '???'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Experience details */}
                  <div className="space-y-3">
                    <h4 className={`font-semibold ${
                      item.unlocked ? 'text-white' : 'text-gray-500'
                    }`}>
                      {item.unlocked ? item.nft.title : '████████████████'}
                    </h4>
                    
                    <p className={`text-sm ${
                      item.unlocked ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.unlocked 
                        ? item.nft.details 
                        : 'This experience is locked. Buy the corresponding NFT to unlock all details of this period!'
                      }
                    </p>
                    
                    {item.unlocked && (
                      <div className="space-y-3 pt-2">
                        <div className="flex flex-wrap gap-2">
                          {item.nft.skills.map((skill) => (
                            <span
                              key={skill}
                              className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        {/* View Experience Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate(`/nft/${item.id}`)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Complete Experience</span>
                        </motion.button>
                      </div>
                    )}
                    
                    {!item.unlocked && item.nft.price > 0 && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-emerald-300">
                            Unlock this experience
                          </span>
                          <span className="text-sm font-semibold text-emerald-200">
                            {item.nft.price} PFT
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {!item.unlocked && item.nft.price === 0 && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Award className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-300">
                            Claim this NFT for free!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="glassmorphism rounded-xl p-6 text-center"
      >
        <h3 className="text-xl font-bold mb-4">Unlock My Complete Journey</h3>
        <p className="text-gray-400 mb-6">
          Each NFT reveals part of my professional story. The more NFTs you own, 
          the more you learn about my skills and experiences!
        </p>
        
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            View Marketplace
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary"
          >
            Start Staking
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}