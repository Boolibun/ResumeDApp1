import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useReadContract } from 'wagmi';
import { MessageCircle, Send, X, Bot, User, Lock, Star } from 'lucide-react';
import { CONTRACT_ADDRESSES, PORTFOLIO_NFT_ABI, NFT_DATA } from '../contracts';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I\'m this developer\'s personal AI assistant. Ask me questions about their journey!',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { address, isConnected } = useAccount();
  
  // Check if user has claimed initial NFT
  const { data: hasClaimed } = useReadContract({
    address: CONTRACT_ADDRESSES.PORTFOLIO_NFT,
    abi: PORTFOLIO_NFT_ABI,
    functionName: 'hasClaimed',
    args: [address],
    enabled: !!address && isConnected,
  });
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Get user's unlocked NFTs (for demo, only NFT #1 if claimed)
  const getUnlockedNFTs = () => {
    if (!isConnected || !hasClaimed) return [];
    return [NFT_DATA[1]]; // Only first NFT unlocked in demo
  };
  
  const getAvatarLevel = () => {
    const unlockedCount = getUnlockedNFTs().length;
    if (unlockedCount === 0) return 'basic';
    if (unlockedCount <= 2) return 'intermediate';
    return 'advanced';
  };
  
  const getContextForAI = () => {
    const unlockedNFTs = getUnlockedNFTs();
    const unlockedCount = unlockedNFTs.length;
    const totalCount = Object.keys(NFT_DATA).length;
    
    return {
      unlockedExperiences: unlockedNFTs,
      unlockedCount,
      totalCount,
      accessLevel: getAvatarLevel(),
    };
  };
  
  const getSuggestedQuestions = () => {
    const unlockedNFTs = getUnlockedNFTs();
    const suggestions = [
      "Tell me about your journey",
      "What are your main skills?",
      "How to unlock more experiences?",
    ];
    
    if (unlockedNFTs.length > 0) {
      suggestions.push("Tell me about your first blockchain project");
    }
    
    return suggestions;
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Simulate AI response based on context
      const context = getContextForAI();
      const aiResponse = await simulateAIResponse(inputValue, context);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I\'m experiencing a technical issue. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const simulateAIResponse = async (question, context) => {
    // This would normally call the Claude API
    // For demo purposes, we'll simulate responses based on context
    
    const lowerQuestion = question.toLowerCase();
    
    // Check if asking about locked content
    const lockedKeywords = ['dao', 'l2', 'bridge', 'defi', 'marketplace', 'senior', 'consultant'];
    const hasLockedKeyword = lockedKeywords.some(keyword => lowerQuestion.includes(keyword));
    
    if (hasLockedKeyword && context.unlockedCount < 2) {
      return `This information is part of a still locked experience! 🔒 
      
You currently have access to ${context.unlockedCount}/${context.totalCount} experiences. To unlock more details about my journey, you can:

• Stake your NFTs to earn PFT tokens
• Use your tokens to buy new NFTs in the Marketplace
• Each NFT unlocks new information about my skills!

Ask me questions about my unlocked experiences instead 😊`;
    }
    
    // Respond based on unlocked content
    if (lowerQuestion.includes('journey') || lowerQuestion.includes('experience') || lowerQuestion.includes('parcours') || lowerQuestion.includes('expérience')) {
      if (context.unlockedCount === 0) {
        return `I can't tell you about my complete journey yet! 🔒
        
First claim your free NFT to unlock my first experience, then stake it to earn tokens and buy other NFTs.

The more NFTs you unlock, the more information I'll have to share about my journey!`;
      }
      
      return `Based on your unlocked NFTs, I can tell you about my blockchain beginning! 

My first project was a simple smart contract deployed on testnet. It was a great experience that gave me the basics in Solidity and Hardhat. I learned the importance of testing and security in blockchain development.

Unlock more NFTs to learn about my DeFi projects, DAO experiences, and Layer 2 developments! 🚀`;
    }
    
    if (lowerQuestion.includes('skill') || lowerQuestion.includes('compétence')) {
      return `My main skills include:

**Blockchain & Smart Contracts:**
• Solidity (smart contract development)
• Hardhat/Truffle (development framework)
• Web3.js/Ethers.js (frontend integration)

**Frontend Development:**
• React/Next.js
• TypeScript
• TailwindCSS

Unlock more NFTs to discover my advanced skills in DeFi, DAO governance, and Layer 2 architecture! 💪`;
    }
    
    if (lowerQuestion.includes('token') || lowerQuestion.includes('nft') || lowerQuestion.includes('unlock') || lowerQuestion.includes('débloquer')) {
      return `Here's how the unlock system works:

🎯 **Steps:**
1. Claim your first NFT for free
2. Stake it to generate 1 PFT/day
3. Use your tokens to buy new NFTs

💰 **NFT Prices:**
• DeFi Dashboard (Rare): 50 PFT
• NFT Marketplace (Epic): 150 PFT  
• DAO Governance (Epic): 200 PFT
• L2 Bridge (Legendary): 500 PFT

The higher the rarity, the more tokens you earn from staking! 📈`;
    }
    
    // Default response
    return `That's an excellent question! 🤔

I can only tell you about the experiences you've unlocked. Currently, you have access to ${context.unlockedCount}/${context.totalCount} experiences.

Try asking me questions about:
• My general journey
• My development skills
• How to unlock more experiences

Or unlock more NFTs so I can tell you more about my specialized projects! 🔓`;
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg z-50 flex items-center justify-center ${
          isOpen ? 'hidden' : ''
        } ${getAvatarLevel() === 'basic' ? 'bg-gradient-to-r from-gray-600 to-gray-700' :
          getAvatarLevel() === 'intermediate' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
          'bg-gradient-to-r from-yellow-500 to-orange-500'
        }`}
      >
        <div className="relative">
          <Bot className="w-8 h-8 text-white" />
          {getUnlockedNFTs().length > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{getUnlockedNFTs().length}</span>
            </div>
          )}
        </div>
      </motion.button>
      
      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] glassmorphism rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`p-4 border-b border-white/10 flex items-center justify-between ${
              getAvatarLevel() === 'basic' ? 'bg-gradient-to-r from-gray-600/20 to-gray-700/20' :
              getAvatarLevel() === 'intermediate' ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20' :
              'bg-gradient-to-r from-yellow-500/20 to-orange-500/20'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  getAvatarLevel() === 'basic' ? 'bg-gray-600' :
                  getAvatarLevel() === 'intermediate' ? 'bg-green-600' :
                  'bg-yellow-600'
                }`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-gray-400">
                    Level {getAvatarLevel()} • {getUnlockedNFTs().length}/{Object.keys(NFT_DATA).length} NFTs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="w-4 h-4 mt-0.5 text-green-400" />
                      )}
                      {message.type === 'user' && (
                        <User className="w-4 h-4 mt-0.5" />
                      )}
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-green-400" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-white/10 border-b">
                <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedQuestions().map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your question..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {!isConnected && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Connect your wallet for a personalized experience
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}