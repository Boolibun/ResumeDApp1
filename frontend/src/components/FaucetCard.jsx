import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Droplets, Coins, CheckCircle2, Clock, Timer } from 'lucide-react';
import { CONTRACT_ADDRESSES, PORTFOLIO_TOKEN_ABI, PFT_FAUCET_ABI } from '../contracts';

export default function FaucetCard() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Get user's faucet info
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.PFT_FAUCET,
    abi: PFT_FAUCET_ABI,
    functionName: 'getUserInfo',
    args: [address],
    enabled: !!address && isConnected && !!CONTRACT_ADDRESSES.PFT_FAUCET,
  });
  
  // Get user's token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && isConnected && !!CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
  });
  
  // Get faucet amount constant
  const { data: faucetAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.PFT_FAUCET,
    abi: PFT_FAUCET_ABI,
    functionName: 'FAUCET_AMOUNT',
    enabled: !!CONTRACT_ADDRESSES.PFT_FAUCET,
  });
  
  // Check if faucet is active
  const { data: faucetActive } = useReadContract({
    address: CONTRACT_ADDRESSES.PFT_FAUCET,
    abi: PFT_FAUCET_ABI,
    functionName: 'faucetActive',
    enabled: !!CONTRACT_ADDRESSES.PFT_FAUCET,
  });
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  
  // Update countdown timer
  useEffect(() => {
    if (userInfo && userInfo[1] > 0) {
      setTimeLeft(Number(userInfo[1]));
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            refetchUserInfo();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [userInfo, refetchUserInfo]);
  
  useEffect(() => {
    if (isConfirmed) {
      refetchUserInfo();
      refetchBalance();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [isConfirmed, refetchUserInfo, refetchBalance]);
  
  const handleClaimTokens = async () => {
    console.log('🚀 Attempting to claim from faucet...');
    console.log('📍 Faucet address:', CONTRACT_ADDRESSES.PFT_FAUCET);
    console.log('👤 User address:', address);
    
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.PFT_FAUCET,
        abi: PFT_FAUCET_ABI,
        functionName: 'claimTokens',
      });
    } catch (error) {
      console.error('❌ Error during faucet claim:', error);
      alert('Error: ' + error.message);
    }
  };
  
  const formatTime = (seconds) => {
    if (seconds <= 0) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };
  
  // Don't show if no contract address or not connected
  if (!CONTRACT_ADDRESSES.PFT_FAUCET || !isConnected || !faucetActive) {
    return null;
  }
  
  const canClaim = userInfo ? userInfo[0] : false;
  const claimedToday = userInfo ? Number(formatEther(userInfo[4])) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glassmorphism rounded-xl p-6 border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 mb-8"
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
            <Droplets className="w-16 h-16 text-blue-400 mx-auto" />
          )}
        </motion.div>
        
        <h3 className="text-2xl font-bold mb-2 text-blue-400">
          {showSuccess ? 'Tokens Received!' : 'PFT Faucet'}
        </h3>
        
        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-lg text-blue-300">
              🎉 You received {faucetAmount ? formatEther(faucetAmount) : '100'} PFT!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <Coins className="w-4 h-4" />
              <span>Current balance: {tokenBalance ? formatEther(tokenBalance) : '0'} PFT</span>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-gray-300">
              Claim <span className="text-blue-400 font-bold">
                {faucetAmount ? formatEther(faucetAmount) : '100'} PFT
              </span> every hour!
            </p>
            
            {!canClaim && timeLeft > 0 && (
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-sm">
                <div className="flex items-center justify-center space-x-2 text-orange-300 mb-2">
                  <Timer className="w-4 h-4" />
                  <span className="font-bold">Next claim in: {formatTime(timeLeft)}</span>
                </div>
                <p className="text-orange-200 text-xs">
                  You can claim every hour. Come back when the timer reaches zero!
                </p>
              </div>
            )}
            
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-sm">
              <p className="text-blue-300 mb-2">
                💧 <strong>Faucet System</strong>
              </p>
              <ul className="text-left space-y-1 text-blue-200">
                <li>• Get 100 PFT every hour</li>
                <li>• Maximum 1000 PFT per day</li>
                <li>• Use tokens to buy NFTs</li>
                <li>• Stake tokens for more rewards</li>
              </ul>
              {claimedToday > 0 && (
                <p className="text-blue-200 text-xs mt-2">
                  📊 Today's claims: {claimedToday} PFT
                </p>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: canClaim ? 1.05 : 1 }}
              whileTap={{ scale: canClaim ? 0.95 : 1 }}
              onClick={handleClaimTokens}
              disabled={isConfirming || !canClaim}
              className={`btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto ${
                !canClaim ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isConfirming ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : !canClaim && timeLeft > 0 ? (
                <>
                  <Timer className="w-5 h-5" />
                  <span>Wait {formatTime(timeLeft)}</span>
                </>
              ) : (
                <>
                  <Droplets className="w-5 h-5" />
                  <span>Claim {faucetAmount ? formatEther(faucetAmount) : '100'} PFT</span>
                </>
              )}
            </motion.button>
            
            <p className="text-xs text-gray-500">
              ⏱️ 1 hour cooldown between claims
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}