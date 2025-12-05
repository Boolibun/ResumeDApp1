import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Gift, Coins, CheckCircle2, Clock } from 'lucide-react';
import { CONTRACT_ADDRESSES, PORTFOLIO_TOKEN_ABI } from '../contracts';

export default function FreeMintCard() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Check if user has claimed free mint
  const { data: hasClaimedFreeMint, refetch: refetchClaimed, error: claimError, isLoading: claimLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'hasClaimedFreeMint',
    args: [address],
    enabled: !!address && isConnected && !!CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
  });
  
  // Get user's token balance
  const { data: tokenBalance, refetch: refetchBalance, error: balanceError, isLoading: balanceLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && isConnected && !!CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
  });
  
  // Get the free mint amount
  const { data: freeMintAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'FREE_MINT_AMOUNT',
    enabled: !!CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
  });
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  
  useEffect(() => {
    if (isConfirmed) {
      refetchClaimed();
      refetchBalance();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [isConfirmed, refetchClaimed, refetchBalance]);
  
  
  
  const handleFreeMint = async () => {
    console.log('🚀 Attempting to claim...');
    console.log('📍 Contract address:', CONTRACT_ADDRESSES.PORTFOLIO_TOKEN);
    console.log('👤 User address:', address);
    console.log('🔗 Connected:', isConnected);
    
    try {
      console.log('📝 Calling writeContract...');
      writeContract({
        address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
        abi: PORTFOLIO_TOKEN_ABI,
        functionName: 'claimFreeMint',
      });
      console.log('✅ writeContract called successfully');
    } catch (error) {
      console.error('❌ Error during claim:', error);
      alert('Error: ' + error.message);
    }
  };
  
  // Don't show if no contract address
  if (!CONTRACT_ADDRESSES.PORTFOLIO_TOKEN) {
    return null;
  }
  
  // Don't show if not connected
  if (!isConnected) {
    return null;
  }
  
  // Check if already claimed (either by contract call OR by having 100+ tokens)
  const hasAlreadyClaimed = hasClaimedFreeMint || (tokenBalance && Number(formatEther(tokenBalance)) >= 100);
  
  // Don't show anything if already claimed
  if (hasAlreadyClaimed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glassmorphism rounded-xl p-6 border-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 mb-8"
    >
      <div className="text-center">
        <motion.div
          animate={{ 
            rotate: showSuccess ? 360 : 0,
            scale: showSuccess ? 1.2 : 1 
          }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          {showSuccess ? (
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
          ) : (
            <Gift className="w-16 h-16 text-green-400 mx-auto" />
          )}
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-2 text-green-400">
          {showSuccess ? 'Tokens Received!' : 'Welcome Bonus'}
        </h3>
        
        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-lg text-green-300">
              🎉 You received {freeMintAmount ? formatEther(freeMintAmount) : '100'} PFT!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <Coins className="w-4 h-4" />
              <span>Current balance: {tokenBalance ? formatEther(tokenBalance) : '0'} PFT</span>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-gray-300">
              Claim <span className="text-green-400 font-bold">
                {freeMintAmount ? formatEther(freeMintAmount) : '100'} PFT
              </span> for free to get started!
            </p>
            
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-sm">
              <p className="text-green-300 mb-2">
                💡 <strong>Why free tokens?</strong>
              </p>
              <ul className="text-left space-y-1 text-green-200">
                <li>• Stake your NFTs to generate more tokens</li>
                <li>• Buy new NFTs in the marketplace</li>
                <li>• Unlock more experiences with AI</li>
              </ul>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFreeMint}
              disabled={isConfirming}
              className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {isConfirming ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5" />
                  <span>Claim {freeMintAmount ? formatEther(freeMintAmount) : '100'} Free PFT</span>
                </>
              )}
            </motion.button>
            
            <p className="text-xs text-gray-500">
              ⚠️ Only one claim per wallet
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}