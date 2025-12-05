import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { ShoppingBag, Coins, Lock, CheckCircle, Star } from 'lucide-react';
import { 
  CONTRACT_ADDRESSES, 
  NFT_MARKETPLACE_ABI, 
  PORTFOLIO_TOKEN_ABI,
  PORTFOLIO_NFT_ABI,
  NFT_DATA,
  RARITY_COLORS 
} from '../contracts';

export default function Marketplace() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  
  const [approvingNFT, setApprovingNFT] = useState(null);
  const [purchasingNFT, setPurchasingNFT] = useState(null);
  
  // Get user's token balance
  const { data: tokenBalance, refetch: refetchTokens } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Check allowance for marketplace
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
    abi: PORTFOLIO_TOKEN_ABI,
    functionName: 'allowance',
    args: [address, CONTRACT_ADDRESSES.NFT_MARKETPLACE],
    enabled: !!address && !!CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
  });

  // Get user's owned NFTs
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

  // Handle transaction confirmations
  useEffect(() => {
    if (isConfirmed && approvingNFT) {
      console.log('✅ Approval confirmed for NFT #', approvingNFT);
      setApprovingNFT(null);
      refetchAllowance();
    } else if (isConfirmed && purchasingNFT) {
      console.log('🎉 NFT purchased successfully!');
      refetchTokens();
      refetchAllowance();
      refetchOwnedNFTs();
      setPurchasingNFT(null);
    }
  }, [isConfirmed, approvingNFT, purchasingNFT, refetchTokens, refetchAllowance, refetchOwnedNFTs]);

  const handleApprove = async (nftId, price) => {
    try {
      setApprovingNFT(nftId);
      console.log('💰 Token approval for NFT #', nftId, ':', price, 'PFT');
      
      await writeContract({
        address: CONTRACT_ADDRESSES.PORTFOLIO_TOKEN,
        abi: PORTFOLIO_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.NFT_MARKETPLACE, parseEther(price.toString())],
        gas: 100000n,
      });
    } catch (error) {
      console.error('❌ Error during approval:', error);
      setApprovingNFT(null);
      alert('Approval error: ' + error.message);
    }
  };

  const handlePurchase = async (nftId) => {
    try {
      setPurchasingNFT(nftId);
      console.log('🛍️ Purchase NFT #', nftId);
      
      await writeContract({
        address: CONTRACT_ADDRESSES.NFT_MARKETPLACE,
        abi: NFT_MARKETPLACE_ABI,
        functionName: 'purchaseNFT',
        args: [nftId],
        gas: 300000n,
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'achat:', error);
      setPurchasingNFT(null);
      alert('Erreur lors de l\'achat: ' + error.message);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Connectez votre wallet pour accéder au marketplace</p>
      </div>
    );
  }

  const availableNFTs = Object.values(NFT_DATA); // All NFTs including #1 (free)
  const canAfford = (price) => tokenBalance && Number(formatEther(tokenBalance)) >= price;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-matrix animate-matrix-flash">
          🛍️ NFT Marketplace
        </h2>
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <Coins className="w-4 h-4" />
          <span>Balance: {tokenBalance ? formatEther(tokenBalance) : '0'} PFT</span>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableNFTs.map((nft) => (
          <NFTCard
            key={nft.id}
            nft={nft}
            canAfford={canAfford(nft.price)}
            approvingNFT={approvingNFT}
            purchasingNFT={purchasingNFT}
            allowance={allowance}
            onApprove={handleApprove}
            onPurchase={handlePurchase}
            address={address}
            userOwnedNFTs={userOwnedNFTs}
          />
        ))}
      </div>
    </div>
  );
}

function NFTCard({ nft, canAfford, approvingNFT, purchasingNFT, allowance, onApprove, onPurchase, address, userOwnedNFTs }) {
  const priceInWei = parseEther(nft.price.toString());
  const hasEnoughAllowance = allowance && allowance >= priceInWei;
  const isApproving = approvingNFT === nft.id;
  const isPurchasing = purchasingNFT === nft.id;

  // Check if user actually owns this NFT
  const isOwned = userOwnedNFTs ? userOwnedNFTs.map(id => Number(id)).includes(nft.id) : false;
  
  // Debug log
  console.log(`🛒 Marketplace NFT #${nft.id}:`, {
    userOwnedNFTs: userOwnedNFTs?.map(id => Number(id)),
    isOwned
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism rounded-xl p-6 border-2 border-emerald-500/30"
    >
      {/* NFT Image */}
      <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 overflow-hidden">
        <img 
          src={nft.image} 
          alt={nft.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* NFT Header */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{nft.title}</h3>
        <div className="text-lg text-emerald-400 font-bold">{nft.price} PFT</div>
      </div>

      {/* Status */}
      <div className="mb-4">
        {isOwned ? (
          <div className="bg-green-600/20 border border-green-500/30 text-green-400 py-2 px-4 rounded-lg text-center">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            NFT Owned
          </div>
        ) : !canAfford ? (
          <div className="bg-gray-700 text-gray-400 py-2 px-4 rounded-lg text-center">
            <Lock className="w-4 h-4 inline mr-2" />
            Insufficient tokens
          </div>
        ) : (
          <div className="space-y-2">
            {/* Step 1: Approve */}
            {!hasEnoughAllowance ? (
              <button
                onClick={() => onApprove(nft.id, nft.price)}
                disabled={isApproving}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving ? 'Approving...' : `1. Approve ${nft.price} PFT`}
              </button>
            ) : (
              <div className="bg-green-600/20 border border-green-500/30 text-green-400 py-2 px-4 rounded-lg text-center">
                ✅ Tokens approved
              </div>
            )}

            {/* Step 2: Purchase */}
            <button
              onClick={() => onPurchase(nft.id)}
              disabled={!hasEnoughAllowance || isPurchasing}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                hasEnoughAllowance
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {isPurchasing ? 'Purchasing...' : '2. Buy NFT'}
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm">{nft.description}</p>
    </motion.div>
  );
}