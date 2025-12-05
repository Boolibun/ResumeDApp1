import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { Gift, Coins, CheckCircle2, Clock } from 'lucide-react';
import { CONTRACT_ADDRESSES, PORTFOLIO_TOKEN_ABI, PORTFOLIO_NFT_ABI } from '../contracts';

export default function ClaimSection() {
  const { address, isConnected } = useAccount();
  const { writeContract: writeNFTContract, data: nftHash } = useWriteContract();
  const [showNFTSuccess, setShowNFTSuccess] = useState(false);
  
  // Check if user has claimed initial NFT (for potential future free NFT claims)
  const { data: hasClaimedNFT, refetch: refetchNFTClaimed } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
    abi: PORTFOLIO_NFT_ABI,
    functionName: 'hasClaimed',
    args: [address],
    enabled: !!address && isConnected,
  });
  
  // Get user's token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && isConnected && !!CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
  });
  
  // Since we removed free mint functionality, this component no longer needs to show anything
  // All token claiming is now handled by the faucet system
  return null;
}