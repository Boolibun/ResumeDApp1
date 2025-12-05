import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Droplets, Coins, Zap, Clock, Info, AlertTriangle, Timer } from 'lucide-react';
import { CONTRACT_ADDRESSES, PFT_FAUCET_ABI, PORTFOLIO_TOKEN_ABI } from '../contracts';

export default function Faucet() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [ethAmount, setEthAmount] = useState('0.1');
  const [isClaimingEth, setIsClaimingEth] = useState(false);
  const [showPftSuccess, setShowPftSuccess] = useState(false);
  
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
  
  // Get faucet amount and status
  const { data: faucetAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.PFT_FAUCET,
    abi: PFT_FAUCET_ABI,
    functionName: 'FAUCET_AMOUNT',
    enabled: !!CONTRACT_ADDRESSES.PFT_FAUCET,
  });
  
  const { data: faucetActive } = useReadContract({
    address: CONTRACT_ADDRESSES.PFT_FAUCET,
    abi: PFT_FAUCET_ABI,
    functionName: 'faucetActive',
    enabled: !!CONTRACT_ADDRESSES.PFT_FAUCET,
  });
  
  // Wait for PFT transaction confirmation
  const { isLoading: isPftConfirming, isSuccess: isPftConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  
  const handleClaimPFT = async () => {
    if (!isConnected || !CONTRACT_ADDRESSES.PFT_FAUCET) return;
    
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.PFT_FAUCET,
        abi: PFT_FAUCET_ABI,
        functionName: 'claimTokens',
      });
    } catch (error) {
      console.error('❌ Error claiming PFT:', error);
      alert('Erreur: ' + error.message);
    }
  };
  
  // Handle PFT transaction success
  useEffect(() => {
    if (isPftConfirmed) {
      refetchUserInfo();
      refetchBalance();
      setShowPftSuccess(true);
      setTimeout(() => setShowPftSuccess(false), 5000);
    }
  }, [isPftConfirmed, refetchUserInfo, refetchBalance]);

  const handleClaimETH = async () => {
    if (!isConnected) return;
    
    setIsClaimingEth(true);
    // TODO: Implémenter la logique de claim ETH
    setTimeout(() => {
      setIsClaimingEth(false);
      // Simulation - à remplacer par la vraie logique plus tard
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-matrix animate-matrix-flash">
          💧 Testnet Faucet
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Get free PFT tokens and Sepolia ETH to test the application
        </p>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-green-400 font-semibold mb-1">Sepolia Testnet Network</h3>
            <p className="text-sm text-gray-300">
              This faucet distributes test tokens on the Sepolia network. These tokens have no real value and are only for testing purposes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Faucet Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Real PFT Faucet */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glassmorphism rounded-xl p-6"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Portfolio Token (PFT)</h2>
            <p className="text-gray-400">
              Get {faucetAmount ? formatEther(faucetAmount) : '100'} PFT every hour
            </p>
          </div>

          <div className="space-y-4">
            {/* User balance */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Your Balance:</span>
                <span className="text-white font-medium">
                  {tokenBalance ? formatEther(tokenBalance) : '0'} PFT
                </span>
              </div>
            </div>

            {/* Countdown or ready status */}
            {userInfo && userInfo[1] > 0 ? (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Timer className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300">
                    Next claim in: {Math.floor(Number(userInfo[1]) / 3600)}h {Math.floor((Number(userInfo[1]) % 3600) / 60)}m {Number(userInfo[1]) % 60}s
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Coins className="w-4 h-4 text-green-400" />
                  <span className="text-green-300">Ready to claim!</span>
                </div>
              </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300">Limit: 1000 PFT per 24h</span>
              </div>
              {userInfo && userInfo[4] && (
                <p className="text-xs text-yellow-200 mt-1">
                  Today: {formatEther(userInfo[4])} PFT claimed
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: userInfo && userInfo[0] ? 1.02 : 1 }}
              whileTap={{ scale: userInfo && userInfo[0] ? 0.98 : 1 }}
              onClick={handleClaimPFT}
              disabled={!isConnected || isPftConfirming || !faucetActive || (userInfo && !userInfo[0])}
              className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isPftConfirming ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : (userInfo && !userInfo[0] && userInfo[1] > 0) ? (
                <>
                  <Timer className="w-5 h-5" />
                  <span>Wait {Math.floor(Number(userInfo[1]) / 60)}min</span>
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5" />
                  <span>Claim {faucetAmount ? formatEther(faucetAmount) : '100'} PFT</span>
                </>
              )}
            </motion.button>

            {!faucetActive && (
              <p className="text-xs text-red-400 text-center">
                ⚠️ Faucet is currently inactive
              </p>
            )}
          </div>
        </motion.div>

        {/* ETH Faucet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glassmorphism rounded-xl p-6"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ethereum Sepolia (ETH)</h2>
            <p className="text-gray-400">
              Get Sepolia ETH to pay transaction fees (gas)
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
Amount to receive
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  placeholder="0.1"
                  min="0.01"
                  max="1"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  ETH
                </span>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Limit: 1 ETH per 24h</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClaimETH}
              disabled={!isConnected || isClaimingEth || !ethAmount || Number(ethAmount) <= 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 text-lg rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isClaimingEth ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Claim {ethAmount} ETH</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <h3 className="text-orange-400 font-semibold mb-1">Wallet not connected</h3>
              <p className="text-sm text-gray-300">
                Connect your wallet to use the faucet and receive test tokens.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glassmorphism rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4">Usage Instructions</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">🪙 Tokens PFT</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Used to buy NFTs in the marketplace</li>
              <li>• Can be staked to generate rewards</li>
              <li>• Limit of 1000 PFT per 24 hours</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-400 mb-2">⚡ ETH Sepolia</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Required to pay transaction fees</li>
              <li>• Used for all blockchain interactions</li>
              <li>• Limit of 1 ETH per 24 hours</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}