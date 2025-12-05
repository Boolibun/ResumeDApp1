import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Eye } from 'lucide-react';
import { 
  CONTRACT_ADDRESSES, 
  PORTFOLIO_NFT_ABI, 
  NFT_DATA,
  RARITY_COLORS 
} from '../contracts';

export default function NFTCollection() {
  const { address, isConnected } = useAccount();
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const { writeContract, data: hash } = useWriteContract();
  const navigate = useNavigate();
  
  

  // Get user's owned NFTs using the new function
  const { data: userOwnedNFTs, refetch: refetchOwnedNFTs } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
    abi: PORTFOLIO_NFT_ABI,
    functionName: 'getOwnedTokens',
    args: [address],
    enabled: !!address && isConnected,
  });
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  
  // Update ownedNFTs when userOwnedNFTs changes
  useEffect(() => {
    if (userOwnedNFTs) {
      const nftIds = userOwnedNFTs.map(id => Number(id));
      setOwnedNFTs(nftIds);
      console.log('🎯 NFTCollection - Updated owned NFTs:', nftIds);
    } else {
      setOwnedNFTs([]);
    }
  }, [userOwnedNFTs]);

  useEffect(() => {
    if (isConfirmed) {
      refetchOwnedNFTs();
    }
  }, [isConfirmed, refetchOwnedNFTs]);
  
  
  // Get all NFTs with real ownership status
  const getAllNFTs = () => {
    return Object.values(NFT_DATA).map(nft => ({
      ...nft,
      owned: ownedNFTs.includes(nft.id), // Check if user actually owns this NFT
      locked: nft.id > 1 && !ownedNFTs.includes(nft.id), // Lock if not owned and not first NFT
    }));
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-matrix animate-matrix-flash">
          🎨 My NFT Collection
        </h2>
      </div>

      {/* NFT Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getAllNFTs().map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`nft-card ${RARITY_COLORS[nft.rarity]} ${
                nft.locked && !nft.owned ? 'opacity-60' : ''
              }`}
            >
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 overflow-hidden">
                  {nft.locked && !nft.owned ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                          <span className="text-2xl">🔒</span>
                        </div>
                        <p className="text-sm text-gray-400">Locked</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={nft.image} 
                      alt={nft.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    nft.rarity === 'Common' ? 'bg-gray-600' :
                    nft.rarity === 'Rare' ? 'bg-green-600' :
                    nft.rarity === 'Epic' ? 'bg-emerald-600' :
                    'bg-yellow-600'
                  }`}>
                    {nft.rarity}
                  </span>
                </div>
                
                {nft.owned && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Owned
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-2">{nft.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {nft.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {nft.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                {nft.price > 0 && (
                  <div className="text-center text-sm text-gray-400 mb-3">
                    Price: {nft.price} PFT
                  </div>
                )}
                
                {/* View Details Button for owned NFTs */}
                {nft.owned && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/nft/${nft.id}`)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Experience</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}