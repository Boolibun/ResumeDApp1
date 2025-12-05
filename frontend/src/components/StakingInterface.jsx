import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Coins, TrendingUp, Clock, Zap, Wallet, Plus, Minus } from 'lucide-react';
import { 
  CONTRACT_ADDRESSES, 
  STAKING_MANAGER_ABI, 
  PORTFOLIO_NFT_ABI,
  PORTFOLIO_TOKEN_ABI,
  NFT_DATA 
} from '../contracts';

export default function StakingInterface() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [activeTab, setActiveTab] = useState('overview');
  const [tokenStakeAmount, setTokenStakeAmount] = useState('');
  const [nftStakeId, setNftStakeId] = useState('');
  const [realtimeRewards, setRealtimeRewards] = useState('0');
  const [isApproving, setIsApproving] = useState(false);
  const [pendingStakeAmount, setPendingStakeAmount] = useState('');
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [pendingNftId, setPendingNftId] = useState('');
  
  // Get user's NFT staking info
  const { data: nftStakingInfo, refetch: refetchNFTStaking } = useReadContract({
    address: CONTRACT_ADDRESSES.STAKING_MANAGER,
    abi: STAKING_MANAGER_ABI,
    functionName: 'getNFTStakingInfo',
    args: [address],
    enabled: !!address && isConnected,
  });
  
  // Get user's token staking info
  const { data: tokenStakingInfo, refetch: refetchTokenStaking, error: tokenStakingError } = useReadContract({
    address: CONTRACT_ADDRESSES.STAKING_MANAGER,
    abi: STAKING_MANAGER_ABI,
    functionName: 'getTokenStakingInfo', 
    args: [address],
    enabled: !!address && isConnected,
  });
  
  // Get all pending rewards (NFT + Token)
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.STAKING_MANAGER,
    abi: STAKING_MANAGER_ABI,
    functionName: 'getAllPendingRewards',
    args: [address],
    enabled: !!address && isConnected,
  });
  
  // Get user's NFT balance
  const { data: nftBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
    abi: PORTFOLIO_NFT_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Get user's owned NFTs using the new function
  const { data: userOwnedNFTs, refetch: refetchOwnedNFTs } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
    abi: PORTFOLIO_NFT_ABI,
    functionName: 'getOwnedTokens',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Get user's token balance for staking
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'balanceOf',
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
      console.log('🎯 Updated owned NFTs:', nftIds);
    } else {
      setOwnedNFTs([]);
    }
  }, [userOwnedNFTs]);

  // Debug logs in useEffect to avoid infinite re-renders
  useEffect(() => {
    console.log('🔍 Debug StakingInterface:');
    console.log('- Address:', address);
    console.log('- Connected:', isConnected);
    console.log('- Contract address:', CONTRACT_ADDRESSES.STAKING_MANAGER);
    console.log('- NFT staking info:', nftStakingInfo);
    console.log('- Token staking info:', tokenStakingInfo);
    console.log('- Token staking error:', tokenStakingError);
    console.log('- Pending rewards:', pendingRewards);
    console.log('- User owned NFTs (raw):', userOwnedNFTs);
    console.log('- Owned NFTs (parsed):', ownedNFTs);
  }, [address, isConnected, nftStakingInfo, tokenStakingInfo, tokenStakingError, pendingRewards, userOwnedNFTs, ownedNFTs]);
  
  // Real-time rewards calculation
  useEffect(() => {
    if (!pendingRewards || !tokenStakingInfo) return;
    
    const startTime = Date.now();
    const baseRewards = Number(formatEther(pendingRewards));
    
    const interval = setInterval(() => {
      const now = Date.now();
      const secondsElapsed = (now - startTime) / 1000;
      
      // Calculate rewards per second for all positions
      let totalRewardsPerSecond = 0;
      
      // NFT staking rewards
      if (nftStakingInfo) {
        totalRewardsPerSecond += nftStakingInfo.length * 2;
      }
      
      // Token staking rewards  
      if (tokenStakingInfo) {
        totalRewardsPerSecond += tokenStakingInfo.length * 2;
      }
      
      const newRewards = baseRewards + (secondsElapsed * totalRewardsPerSecond);
      setRealtimeRewards(newRewards.toFixed(6));
    }, 100); // Update every 100ms for smooth animation
    
    return () => clearInterval(interval);
  }, [pendingRewards, nftStakingInfo, tokenStakingInfo]);

  useEffect(() => {
    if (isConfirmed) {
      refetchNFTStaking();
      refetchTokenStaking();
      refetchRewards();
      refetchTokenBalance();
      refetchOwnedNFTs();
      
      // If we just approved tokens, keep the pending state for staking
      if (isApproving && pendingStakeAmount) {
        console.log('✅ Approval confirmed, ready for staking');
        // Don't reset the pending state here - only after actual staking
      } else if (!isApproving && pendingStakeAmount) {
        // This means staking was completed
        console.log('🎉 Staking completed!');
        setTokenStakeAmount('');
        setPendingStakeAmount('');
        setIsApproving(false);
        // Reset NFT staking state too
        setNftStakeId('');
        setPendingNftId('');
      }
      
      // Handle NFT approval completion
      console.log('🔍 Checking NFT approval:', {
        nftStakeId,
        pendingNftId,
        isConfirmed,
        shouldSetPending: nftStakeId && !pendingNftId
      });
      
      if (nftStakeId && !pendingNftId) {
        console.log('🎯 NFT approved, setting pendingNftId:', nftStakeId);
        setPendingNftId(nftStakeId);
      }
    }
  }, [isConfirmed, refetchNFTStaking, refetchTokenStaking, refetchRewards, refetchTokenBalance, refetchOwnedNFTs, isApproving, pendingStakeAmount, nftStakeId, pendingNftId]);
  
  const handleApproveNFT = async (tokenId) => {
    try {
      console.log('🔍 Approving NFT:', tokenId);
      console.log('📍 NFT Contract:', CONTRACT_ADDRESSES.PORTFOLIO_NFT);
      console.log('📍 Staking Manager:', CONTRACT_ADDRESSES.STAKING_MANAGER);
      
      setNftStakeId(tokenId.toString());
      // Don't set pendingNftId here - wait for confirmation
      
      console.log('🚀 Calling writeContract with setApprovalForAll...');
      const result = writeContract({
        address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
        abi: PORTFOLIO_NFT_ABI,
        functionName: 'setApprovalForAll',
        args: [CONTRACT_ADDRESSES.STAKING_MANAGER, true],
        gas: 80000n,
      });
      console.log('✅ WriteContract result:', result);
    } catch (error) {
      console.error('❌ Error approving NFT:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      alert('Erreur lors de l\'approbation NFT: ' + error.message);
    }
  };

  const handleStakeNFTConfirmed = async () => {
    try {
      console.log('🚀 Staking NFT:', nftStakeId);
      console.log('📍 Staking Manager:', CONTRACT_ADDRESSES.STAKING_MANAGER);
      console.log('🔍 Args:', [Number(nftStakeId)]);
      console.log('🔍 Gas:', 300000n);
      
      console.log('📞 Calling writeContract for staking...');
      const result = writeContract({
        address: CONTRACT_ADDRESSES.STAKING_MANAGER,
        abi: STAKING_MANAGER_ABI,
        functionName: 'stakeNFT',
        args: [Number(nftStakeId)],
        gas: 300000n,
      });
      console.log('✅ Staking writeContract result:', result);
    } catch (error) {
      console.error('❌ Error staking NFT:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      alert('Erreur lors du staking NFT: ' + error.message);
    }
  };
  
  const handleApproveTokens = async () => {
    if (!tokenStakeAmount || Number(tokenStakeAmount) <= 0) return;
    
    try {
      setIsApproving(true);
      setPendingStakeAmount(tokenStakeAmount);
      await writeContract({
        address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
        abi: PORTFOLIO_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.STAKING_MANAGER, parseEther(tokenStakeAmount)],
      });
    } catch (error) {
      console.error('Error approving tokens:', error);
      setIsApproving(false);
      setPendingStakeAmount('');
    }
  };
  
  const handleStakeTokens = async () => {
    if (!pendingStakeAmount) return;
    
    try {
      console.log('🚀 Tentative de staking de', pendingStakeAmount, 'PFT');
      console.log('📍 Adresse contrat:', CONTRACT_ADDRESSES.STAKING_MANAGER);
      console.log('💰 Amount in Wei:', parseEther(pendingStakeAmount).toString());
      console.log('📋 ABI stakeTokens:', STAKING_MANAGER_ABI.find(f => f.name === 'stakeTokens'));
      console.log('🔗 writeContract function:', typeof writeContract);
      
      setIsApproving(false); // Marquer qu'on n'est plus en mode approval
      
      // Test with fewer params to see if gas is the issue
      const result = writeContract({
        address: CONTRACT_ADDRESSES.STAKING_MANAGER,
        abi: STAKING_MANAGER_ABI,
        functionName: 'stakeTokens',
        args: [parseEther(pendingStakeAmount)],
      });
      
      console.log('✅ writeContract called successfully, result:', result);
      console.log('🔍 Result type:', typeof result);
      
      // Si c'est une promesse, on peut l'attendre
      if (result && typeof result.then === 'function') {
        console.log('⏳ Result is a promise, waiting...');
        const finalResult = await result;
        console.log('🎯 Final result:', finalResult);
      }
      
    } catch (error) {
      console.error('❌ Error staking tokens:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      alert('Erreur lors du staking: ' + error.message);
    }
  };
  
  const handleUnstakeNFT = async (tokenId) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.STAKING_MANAGER,
        abi: STAKING_MANAGER_ABI,
        functionName: 'unstakeNFT',
        args: [tokenId],
      });
    } catch (error) {
      console.error('Error unstaking NFT:', error);
    }
  };
  
  const handleUnstakeTokens = async (stakingIndex) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.STAKING_MANAGER,
        abi: STAKING_MANAGER_ABI,
        functionName: 'unstakeTokens',
        args: [stakingIndex],
      });
    } catch (error) {
      console.error('Error unstaking tokens:', error);
    }
  };
  
  const handleClaimAllRewards = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.STAKING_MANAGER,
        abi: STAKING_MANAGER_ABI,
        functionName: 'claimAllRewards',
      });
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };
  
  const formatTimeStaked = (stakedAt) => {
    const now = Math.floor(Date.now() / 1000);
    const secondsStaked = now - Number(stakedAt);
    const days = Math.floor(secondsStaked / 86400);
    const hours = Math.floor((secondsStaked % 86400) / 3600);
    const minutes = Math.floor((secondsStaked % 3600) / 60);
    
    if (days > 0) {
      return `${days}j ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };


  const totalStakingPositions = (nftStakingInfo?.length || 0) + (tokenStakingInfo?.length || 0);
  const rewardsPerSecond = totalStakingPositions * 2;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-matrix animate-matrix-flash">
          🏦 Staking Center
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-900/50 rounded-lg p-1">
        {[
          { id: 'overview', name: 'Overview', icon: TrendingUp },
          { id: 'nft', name: 'Stake NFTs', icon: Zap },
          { id: 'tokens', name: 'Stake Tokens', icon: Coins }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span>Staking Rewards</span>
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
            
            <div className="bg-gradient-to-r from-emerald-600/20 to-pink-600/20 rounded-lg p-4 text-center">
              <Wallet className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
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
          
          {(pendingRewards && Number(formatEther(pendingRewards)) > 0) || Number(realtimeRewards) > 0 && (
            <div className="text-center">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <h3 className="text-green-400 font-semibold mb-2">💎 Available Rewards</h3>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Coins className="w-6 h-6 text-green-400" />
                  <span className="text-2xl font-bold font-mono text-green-300">
                    {realtimeRewards} PFT
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Your positions generate {rewardsPerSecond} PFT per second
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimAllRewards}
                disabled={isConfirming || Number(realtimeRewards) === 0}
                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                <Coins className="w-5 h-5" />
                <span>{isConfirming ? 'Claiming...' : `Claim ${realtimeRewards} PFT`}</span>
              </motion.button>
            </div>
          )}
          
          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2">🆕 New Staking System</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• <strong>2 PFT par seconde</strong> pour chaque position de staking (NFT ou tokens)</li>
              <li>• Stake your NFTs or your PFT tokens</li>
              <li>• Rewards calculated in real time</li>
              <li>• Claim whenever you want!</li>
            </ul>
          </div>
        </motion.div>
      )}
      
      {/* NFT Staking Tab */}
      {activeTab === 'nft' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Zap className="w-6 h-6 text-green-400" />
            <span>NFT Staking</span>
          </h2>

          {nftStakingInfo && nftStakingInfo.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">NFTs En Staking</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nftStakingInfo.map((info, index) => {
                  const nftData = NFT_DATA[Number(info.tokenId)] || NFT_DATA[1];
                  return (
                    <motion.div
                      key={`${info.tokenId}-${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="glassmorphism rounded-lg p-4 bg-gradient-to-br from-green-600/10 to-emerald-600/10 border-green-500/30"
                    >
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-green-700 to-green-800 rounded-lg mb-4 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                              <span className="text-lg font-bold text-white">#{info.tokenId.toString()}</span>
                            </div>
                            <p className="text-xs text-green-400">Stakant 2 PFT/s</p>
                          </div>
                        </div>
                        
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Actif
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm">{nftData.title}</h4>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Staked time:</span>
                            <span>{formatTimeStaked(info.stakedAt)}</span>
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUnstakeNFT(info.tokenId)}
                          disabled={isConfirming}
                          className="w-full bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isConfirming ? 'Unstaking...' : 'Unstake'}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}


          {/* Available NFTs for Staking */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-400 mb-3">Your Available NFTs for Staking</h3>
            
            
            {ownedNFTs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ownedNFTs
                  .filter(nftId => !nftStakingInfo?.find(info => Number(info.tokenId) === nftId))
                  .map(nftId => {
                    const nftData = NFT_DATA[nftId] || NFT_DATA[1];
                    return (
                      <motion.div
                        key={nftId}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-green-500 transition-all"
                        onClick={() => {
                          if (pendingNftId === nftId.toString()) {
                            handleStakeNFTConfirmed();
                          } else {
                            handleApproveNFT(nftId);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">#{nftId}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{nftData.title}</p>
                            <p className="text-xs text-gray-400">{nftData.rarity}</p>
                          </div>
                          <div className="text-xs text-green-400 font-medium">
                            {pendingNftId === nftId.toString() ? '2. Staker' : '1. Approver'}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-2">Aucun NFT disponible pour le staking</p>
                <p className="text-xs text-gray-500">
                  {nftBalance === 0 ? 'You don\'t own any NFTs.' : 'All your NFTs are already staked.'}
                </p>
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-3">
              💡 Each staked NFT generates 2 PFT per second, regardless of rarity!
            </p>
          </div>
        </motion.div>
      )}

      {/* Token Staking Tab */}
      {activeTab === 'tokens' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Coins className="w-6 h-6 text-emerald-400" />
            <span>Token Staking</span>
          </h2>


          {/* Stake Tokens Form */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-emerald-400 mb-3">Staker des PFT</h3>
            <div className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Amount to stake"
                    value={tokenStakeAmount}
                    onChange={(e) => setTokenStakeAmount(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    disabled={isApproving}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Balance: {tokenBalance ? formatEther(tokenBalance) : '0'} PFT
                  </p>
                </div>
                
                {!pendingStakeAmount ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApproveTokens}
                    disabled={isConfirming || !tokenStakeAmount || Number(tokenStakeAmount) <= 0}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirming && isApproving ? 'Approving...' : '1. Approver'}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStakeTokens}
                    disabled={isConfirming}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirming ? 'Staking...' : '2. Staker'}
                  </motion.button>
                )}
              </div>
              
              {pendingStakeAmount && (
                <div className="bg-green-600/20 border border-green-500/30 text-green-400 py-2 px-3 rounded-lg text-sm">
                  ✅ {pendingStakeAmount} PFT approved - Click "2. Stake" to finalize
                </div>
              )}
            </div>
          </div>

          {/* Staked Tokens */}
          {tokenStakingInfo && tokenStakingInfo.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Positions de Token Staking</h3>
                <div className="text-right">
                  <p className="text-sm text-green-400">Total rewards</p>
                  <p className="text-xl font-bold text-green-300">{realtimeRewards} PFT</p>
                </div>
              </div>
              {tokenStakingInfo.map((info, index) => (
                <motion.div
                  key={`token-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glassmorphism rounded-lg p-4 bg-gradient-to-r from-emerald-600/10 to-pink-600/10 border-emerald-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-400">{formatEther(info.amount)} PFT</p>
                        <p className="text-sm text-gray-400">
                          Staked since {formatTimeStaked(info.stakedAt)} • 2 PFT/s
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUnstakeTokens(index)}
                      disabled={isConfirming}
                      className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConfirming ? 'Unstaking...' : 'Unstake'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {(!tokenStakingInfo || tokenStakingInfo.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No tokens staked at the moment</p>
              <p className="text-sm text-gray-500">Stake your PFT to start earning 2 PFT per second!</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}