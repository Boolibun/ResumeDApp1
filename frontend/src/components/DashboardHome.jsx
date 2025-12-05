import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Coins, Star, Wallet, TrendingUp, Zap, Clock } from 'lucide-react';
import { 
  CONTRACT_ADDRESSES, 
  PORTFOLIO_TOKEN_ABI,
  PORTFOLIO_NFT_ABI,
  STAKING_MANAGER_ABI,
  NFT_DATA
} from '../contracts';

export default function DashboardHome() {
  const { address, isConnected } = useAccount();
  const [realtimeRewards, setRealtimeRewards] = useState('0');
  
  // Get user's token balance
  const { data: tokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Get user's owned NFTs using the new function
  const { data: userOwnedNFTs } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
    abi: PORTFOLIO_NFT_ABI,
    functionName: 'getOwnedTokens',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Get user's NFT staking info
  const { data: nftStakingInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.STAKING_MANAGER,
    abi: STAKING_MANAGER_ABI,
    functionName: 'getNFTStakingInfo',
    args: [address],
    enabled: !!address && isConnected,
  });
  
  // Get user's token staking info
  const { data: tokenStakingInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.STAKING_MANAGER,
    abi: STAKING_MANAGER_ABI,
    functionName: 'getTokenStakingInfo', 
    args: [address],
    enabled: !!address && isConnected,
  });
  
  // Get all pending rewards (NFT + Token)
  const { data: pendingRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.STAKING_MANAGER,
    abi: STAKING_MANAGER_ABI,
    functionName: 'getAllPendingRewards',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Calculate rewards per second and realtime rewards (same logic as StakingInterface)
  const totalStakingPositions = (nftStakingInfo?.length || 0) + (tokenStakingInfo?.length || 0);
  const rewardsPerSecond = totalStakingPositions * 2;

  // Update realtime rewards every second
  useEffect(() => {
    if (!pendingRewards || !isConnected) {
      setRealtimeRewards('0.00');
      return;
    }

    const baseRewards = Number(formatEther(pendingRewards));
    setRealtimeRewards(baseRewards.toFixed(2));

    if (rewardsPerSecond > 0) {
      const interval = setInterval(() => {
        setRealtimeRewards(prev => {
          const current = Number(prev);
          const newAmount = current + rewardsPerSecond;
          return newAmount.toFixed(2);
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [pendingRewards, rewardsPerSecond, isConnected]);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-matrix animate-matrix-flash">
          🏠 Web3 Portfolio
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Explore my professional journey through interactive NFTs and discover my experiences in the blockchain world.
        </p>
      </div>

      {/* Balance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glassmorphism rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <Wallet className="w-6 h-6" />
          <span>My Tokens & NFTs</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-6 border border-green-500/20"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">PFT Balance</p>
                <p className="text-2xl font-bold">
                  {tokenBalance ? formatEther(tokenBalance) : '0.00'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Use your tokens to buy NFTs and unlock new features
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-6 border border-green-500/20"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">NFTs Owned</p>
                <p className="text-2xl font-bold">
                  {userOwnedNFTs ? userOwnedNFTs.length : 0} / {Object.keys(NFT_DATA).length}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Collect all NFTs to unlock exclusive rewards
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Staking Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glassmorphism rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <Coins className="w-6 h-6 text-yellow-400" />
          <span>Staking Overview</span>
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
            <div className="relative z-10">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-1">💰 Claimable Rewards</p>
              <p className="text-3xl font-bold text-green-400 font-mono tabular-nums">
                {realtimeRewards}
              </p>
              <p className="text-xs text-gray-500">PFT (+ {rewardsPerSecond} PFT/s)</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">Staked NFTs</p>
            <p className="text-2xl font-bold">
              {nftStakingInfo?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-4 text-center">
            <Wallet className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">Staked Tokens</p>
            <p className="text-2xl font-bold">
              {tokenStakingInfo?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Positions</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">Rate/Second</p>
            <p className="text-2xl font-bold">
              {rewardsPerSecond}
            </p>
            <p className="text-xs text-gray-500">PFT/s</p>
          </div>
        </div>
        
        {totalStakingPositions === 0 && (
          <div className="text-center py-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">🚀 Start Staking</h3>
              <p className="text-sm text-gray-400 mb-3">
                Stake your NFTs or tokens to generate passive rewards
              </p>
              <p className="text-xs text-gray-500">
                Go to the Staking tab to get started
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}