import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useReadContract } from 'wagmi';
import { ArrowLeft, Calendar, MapPin, Users, Award, ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESSES, PORTFOLIO_NFT_ABI, NFT_DATA } from '../contracts';

export default function NFTDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  
  const nftId = parseInt(id);
  const nft = NFT_DATA[nftId];

  // Check if user owns this NFT
  const { data: userOwnedNFTs } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
    abi: PORTFOLIO_NFT_ABI,
    functionName: 'getOwnedTokens',
    args: [address],
    enabled: !!address && isConnected,
  });

  const isOwned = userOwnedNFTs ? userOwnedNFTs.map(id => Number(id)).includes(nftId) : false;

  // If NFT doesn't exist, redirect
  useEffect(() => {
    if (!nft) {
      navigate('/dashboard');
    }
  }, [nft, navigate]);

  // If user doesn't own the NFT, show locked content
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-400">Please connect your wallet to view NFT details</p>
        </div>
      </div>
    );
  }

  if (!isOwned) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glassmorphism rounded-2xl p-8 max-w-md text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">🔒 Experience Locked</h2>
          <p className="text-gray-400 mb-6">
            You need to own this NFT to unlock the detailed experience story.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="btn-primary px-6 py-3 rounded-lg"
          >
            Go to Marketplace
          </button>
        </motion.div>
      </div>
    );
  }

  if (!nft) return null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-green-400 hover:text-green-300 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* NFT Image - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glassmorphism rounded-2xl p-6">
              <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden mb-6">
                <img 
                  src={nft.image} 
                  alt={nft.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">{nft.title}</h1>
                <p className="text-green-400 text-xl font-semibold mb-4">{nft.price} PFT</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>NFT #{nftId}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Owned</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Experience Details - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="glassmorphism rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-matrix animate-matrix-flash">
                Professional Experience
              </h2>
              
              {/* Experience Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
                  <Calendar className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-sm text-gray-400">Period</p>
                  <p className="font-semibold">{nft.period || '2020-2023'}</p>
                </div>
                <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
                  <MapPin className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-semibold">{nft.location || 'Remote/Paris'}</p>
                </div>
              </div>

              {/* Main Description */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">About This Experience</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {nft.detailedDescription || nft.description}
                  </p>
                </div>

                {/* Key Achievements */}
                {nft.achievements && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Key Achievements</h3>
                    <ul className="space-y-2">
                      {nft.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Award className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies Used */}
                {nft.technologies && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Technologies & Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {nft.technologies.map((tech, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-sm text-green-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {nft.links && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Related Links</h3>
                    <div className="space-y-2">
                      {nft.links.map((link, index) => (
                        <a 
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>{link.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}