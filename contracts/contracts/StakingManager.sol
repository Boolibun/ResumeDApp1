// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./PortfolioNFT.sol";
import "./PortfolioToken.sol";

/**
 * @title StakingManager
 * @notice Manages NFT and token staking with reward distribution
 * @dev Implements dual staking system for Portfolio NFTs and PFT tokens with time-based rewards
 */
contract StakingManager is ReentrancyGuard, Ownable {
    PortfolioNFT public portfolioNFT;
    PortfolioToken public portfolioToken;
    
    // Reward rate: 2 PFT per second (for all types of staking)
    uint256 public constant REWARD_RATE_PER_SECOND = 2 ether;
    
    struct NFTStakingInfo {
        uint256 tokenId;
        uint256 stakedAt;
        uint256 lastRewardClaimed;
        PortfolioNFT.Rarity rarity;
    }
    
    struct TokenStakingInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastRewardClaimed;
    }
    
    // NFT Staking mappings
    mapping(address => NFTStakingInfo[]) public userNFTStakings;
    mapping(uint256 => address) public nftStaker;
    mapping(uint256 => uint256) public nftStakingIndex;
    
    // Token Staking mappings  
    mapping(address => TokenStakingInfo[]) public userTokenStakings;
    
    event NFTStaked(address indexed user, uint256 indexed tokenId, PortfolioNFT.Rarity rarity);
    event NFTUnstaked(address indexed user, uint256 indexed tokenId);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 stakingIndex);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _portfolioNFT, address _portfolioToken) Ownable(msg.sender) {
        portfolioNFT = PortfolioNFT(_portfolioNFT);
        portfolioToken = PortfolioToken(_portfolioToken);
    }
    
    // ========== NFT STAKING ==========

    /**
     * @notice Stake a Portfolio NFT to earn rewards
     * @param tokenId The ID of the NFT to stake
     */
    function stakeNFT(uint256 tokenId) external nonReentrant {
        require(portfolioNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nftStaker[tokenId] == address(0), "Already staked");
        
        // Get NFT metadata for rarity
        PortfolioNFT.NFTMetadata memory metadata = portfolioNFT.getNFTMetadata(tokenId);
        
        portfolioNFT.transferFrom(msg.sender, address(this), tokenId);
        
        uint256 stakingIndex = userNFTStakings[msg.sender].length;
        userNFTStakings[msg.sender].push(NFTStakingInfo({
            tokenId: tokenId,
            stakedAt: block.timestamp,
            lastRewardClaimed: block.timestamp,
            rarity: metadata.rarity
        }));
        
        nftStaker[tokenId] = msg.sender;
        nftStakingIndex[tokenId] = stakingIndex;
        
        emit NFTStaked(msg.sender, tokenId, metadata.rarity);
    }
    
    // ========== TOKEN STAKING ==========

    /**
     * @notice Stake PFT tokens to earn rewards
     * @param amount The amount of tokens to stake
     */
    function stakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(portfolioToken.balanceOf(msg.sender) >= amount, "Insufficient tokens");
        
        portfolioToken.transferFrom(msg.sender, address(this), amount);
        
        userTokenStakings[msg.sender].push(TokenStakingInfo({
            amount: amount,
            stakedAt: block.timestamp,
            lastRewardClaimed: block.timestamp
        }));
        
        emit TokensStaked(msg.sender, amount);
    }
    
    // ========== UNSTAKING ==========

    /**
     * @notice Unstake an NFT and claim pending rewards
     * @param tokenId The ID of the NFT to unstake
     */
    function unstakeNFT(uint256 tokenId) external nonReentrant {
        require(nftStaker[tokenId] == msg.sender, "Not the staker");
        
        // Claim pending rewards before unstaking
        _claimNFTRewards(tokenId);
        
        uint256 stakingIndex = nftStakingIndex[tokenId];
        NFTStakingInfo[] storage stakings = userNFTStakings[msg.sender];
        
        // Remove from staking array (swap with last element)
        if (stakingIndex != stakings.length - 1) {
            stakings[stakingIndex] = stakings[stakings.length - 1];
            nftStakingIndex[stakings[stakingIndex].tokenId] = stakingIndex;
        }
        stakings.pop();
        
        delete nftStaker[tokenId];
        delete nftStakingIndex[tokenId];
        
        portfolioNFT.transferFrom(address(this), msg.sender, tokenId);
        
        emit NFTUnstaked(msg.sender, tokenId);
    }

    /**
     * @notice Unstake tokens and claim pending rewards
     * @param stakingIndex The index of the staking position to unstake
     */
    function unstakeTokens(uint256 stakingIndex) external nonReentrant {
        TokenStakingInfo[] storage stakings = userTokenStakings[msg.sender];
        require(stakingIndex < stakings.length, "Invalid staking index");
        
        TokenStakingInfo storage stakingInfo = stakings[stakingIndex];
        
        // Claim pending rewards before unstaking
        uint256 rewards = _calculateTokenRewards(stakingInfo);
        if (rewards > 0) {
            portfolioToken.stakingMint(msg.sender, rewards);
            emit RewardsClaimed(msg.sender, rewards);
        }
        
        uint256 stakedAmount = stakingInfo.amount;
        
        // Remove from staking array (swap with last element)
        if (stakingIndex != stakings.length - 1) {
            stakings[stakingIndex] = stakings[stakings.length - 1];
        }
        stakings.pop();
        
        // Return staked tokens
        portfolioToken.transfer(msg.sender, stakedAmount);
        
        emit TokensUnstaked(msg.sender, stakedAmount, stakingIndex);
    }
    
    // ========== CLAIM REWARDS ==========

    /**
     * @notice Claim all pending rewards from NFT and token staking
     */
    function claimAllRewards() external nonReentrant {
        uint256 totalRewards = 0;
        
        // Claim NFT rewards
        NFTStakingInfo[] storage nftStakings = userNFTStakings[msg.sender];
        for (uint256 i = 0; i < nftStakings.length; i++) {
            uint256 rewards = _calculateNFTRewards(nftStakings[i]);
            totalRewards += rewards;
            nftStakings[i].lastRewardClaimed = block.timestamp;
        }
        
        // Claim Token rewards
        TokenStakingInfo[] storage tokenStakings = userTokenStakings[msg.sender];
        for (uint256 i = 0; i < tokenStakings.length; i++) {
            uint256 rewards = _calculateTokenRewards(tokenStakings[i]);
            totalRewards += rewards;
            tokenStakings[i].lastRewardClaimed = block.timestamp;
        }
        
        require(totalRewards > 0, "No rewards to claim");

        portfolioToken.stakingMint(msg.sender, totalRewards);

        emit RewardsClaimed(msg.sender, totalRewards);
    }
    
    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @dev Internal function to claim rewards for a specific NFT
     * @param tokenId The ID of the staked NFT
     */
    function _claimNFTRewards(uint256 tokenId) internal {
        address staker = nftStaker[tokenId];
        uint256 stakingIndex = nftStakingIndex[tokenId];
        NFTStakingInfo storage stakingInfo = userNFTStakings[staker][stakingIndex];
        
        uint256 rewards = _calculateNFTRewards(stakingInfo);
        if (rewards > 0) {
            stakingInfo.lastRewardClaimed = block.timestamp;
            portfolioToken.stakingMint(staker, rewards);
            emit RewardsClaimed(staker, rewards);
        }
    }

    /**
     * @dev Internal function to calculate pending NFT staking rewards
     * @param stakingInfo The staking information
     * @return The amount of pending rewards
     */
    function _calculateNFTRewards(NFTStakingInfo memory stakingInfo) internal view returns (uint256) {
        uint256 timeElapsed = block.timestamp - stakingInfo.lastRewardClaimed;
        // Use dynamic reward rate
        return rewardRatePerSecond * timeElapsed;
    }

    /**
     * @dev Internal function to calculate pending token staking rewards
     * @param stakingInfo The staking information
     * @return The amount of pending rewards
     */
    function _calculateTokenRewards(TokenStakingInfo memory stakingInfo) internal view returns (uint256) {
        uint256 timeElapsed = block.timestamp - stakingInfo.lastRewardClaimed;
        // Use dynamic reward rate
        return rewardRatePerSecond * timeElapsed;
    }
    
    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get all NFT staking positions for a user
     * @param user The address to query
     * @return Array of NFT staking information
     */
    function getNFTStakingInfo(address user) external view returns (NFTStakingInfo[] memory) {
        return userNFTStakings[user];
    }

    /**
     * @notice Get all token staking positions for a user
     * @param user The address to query
     * @return Array of token staking information
     */
    function getTokenStakingInfo(address user) external view returns (TokenStakingInfo[] memory) {
        return userTokenStakings[user];
    }

    /**
     * @notice Get total pending rewards from both NFT and token staking
     * @param user The address to query
     * @return Total pending rewards
     */
    function getAllPendingRewards(address user) external view returns (uint256) {
        uint256 totalRewards = 0;
        
        // NFT rewards
        NFTStakingInfo[] memory nftStakings = userNFTStakings[user];
        for (uint256 i = 0; i < nftStakings.length; i++) {
            totalRewards += _calculateNFTRewards(nftStakings[i]);
        }
        
        // Token rewards  
        TokenStakingInfo[] memory tokenStakings = userTokenStakings[user];
        for (uint256 i = 0; i < tokenStakings.length; i++) {
            totalRewards += _calculateTokenRewards(tokenStakings[i]);
        }
        
        return totalRewards;
    }

    /**
     * @notice Get pending rewards from NFT staking only
     * @param user The address to query
     * @return Pending NFT rewards
     */
    function getNFTPendingRewards(address user) external view returns (uint256) {
        uint256 totalRewards = 0;
        NFTStakingInfo[] memory stakings = userNFTStakings[user];
        
        for (uint256 i = 0; i < stakings.length; i++) {
            totalRewards += _calculateNFTRewards(stakings[i]);
        }
        
        return totalRewards;
    }

    /**
     * @notice Get pending rewards from token staking only
     * @param user The address to query
     * @return Pending token rewards
     */
    function getTokenPendingRewards(address user) external view returns (uint256) {
        uint256 totalRewards = 0;
        TokenStakingInfo[] memory stakings = userTokenStakings[user];
        
        for (uint256 i = 0; i < stakings.length; i++) {
            totalRewards += _calculateTokenRewards(stakings[i]);
        }
        
        return totalRewards;
    }
    
    // ========== BATCH FUNCTIONS ==========

    /**
     * @notice Stake multiple NFTs in a single transaction
     * @param tokenIds Array of NFT IDs to stake
     */
    function stakeMultipleNFTs(uint256[] calldata tokenIds) external nonReentrant {
        require(tokenIds.length > 0, "No NFTs to stake");
        require(tokenIds.length <= 10, "Too many NFTs"); // Gas limit
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(portfolioNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
            require(nftStaker[tokenId] == address(0), "NFT already staked");
            
            // Get NFT metadata for rarity
            PortfolioNFT.NFTMetadata memory metadata = portfolioNFT.getNFTMetadata(tokenId);
            
            portfolioNFT.transferFrom(msg.sender, address(this), tokenId);
            
            uint256 stakingIndex = userNFTStakings[msg.sender].length;
            userNFTStakings[msg.sender].push(NFTStakingInfo({
                tokenId: tokenId,
                stakedAt: block.timestamp,
                lastRewardClaimed: block.timestamp,
                rarity: metadata.rarity
            }));
            
            nftStaker[tokenId] = msg.sender;
            nftStakingIndex[tokenId] = stakingIndex;
            
            emit NFTStaked(msg.sender, tokenId, metadata.rarity);
        }
    }
    
    /**
     * @notice Unstake multiple NFTs in a single transaction with auto-claim
     * @param tokenIds Array of NFT IDs to unstake
     */
    function unstakeMultipleNFTs(uint256[] calldata tokenIds) external nonReentrant {
        require(tokenIds.length > 0, "No NFTs to unstake");
        require(tokenIds.length <= 10, "Too many NFTs"); // Gas limit
        
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(nftStaker[tokenId] == msg.sender, "Not the staker");
            
            // Calculate rewards before unstaking
            uint256 stakingIndex = nftStakingIndex[tokenId];
            NFTStakingInfo storage stakingInfo = userNFTStakings[msg.sender][stakingIndex];
            uint256 rewards = _calculateNFTRewards(stakingInfo);
            totalRewards += rewards;
            
            // Remove from staking array
            NFTStakingInfo[] storage stakings = userNFTStakings[msg.sender];
            if (stakingIndex != stakings.length - 1) {
                stakings[stakingIndex] = stakings[stakings.length - 1];
                nftStakingIndex[stakings[stakingIndex].tokenId] = stakingIndex;
            }
            stakings.pop();
            
            delete nftStaker[tokenId];
            delete nftStakingIndex[tokenId];
            
            portfolioNFT.transferFrom(address(this), msg.sender, tokenId);
            
            emit NFTUnstaked(msg.sender, tokenId);
        }
        
        // Mint all rewards at once
        if (totalRewards > 0) {
            portfolioToken.stakingMint(msg.sender, totalRewards);
            emit RewardsClaimed(msg.sender, totalRewards);
        }
    }
    
    // ========== USER EXPERIENCE FUNCTIONS ==========

    /// @notice Struct containing all user staking information
    struct UserStakingInfo {
        NFTStakingInfo[] nftStakings;
        TokenStakingInfo[] tokenStakings;
        uint256 totalPendingRewards;
        uint256 nftPendingRewards;
        uint256 tokenPendingRewards;
    }

    /**
     * @notice Get comprehensive staking information for a user
     * @param user The address to query
     * @return UserStakingInfo struct with all staking data and pending rewards
     */
    function getAllUserInfo(address user) external view returns (UserStakingInfo memory) {
        NFTStakingInfo[] memory nftStakings = userNFTStakings[user];
        TokenStakingInfo[] memory tokenStakings = userTokenStakings[user];
        
        uint256 nftRewards = 0;
        for (uint256 i = 0; i < nftStakings.length; i++) {
            nftRewards += _calculateNFTRewards(nftStakings[i]);
        }
        
        uint256 tokenRewards = 0;
        for (uint256 i = 0; i < tokenStakings.length; i++) {
            tokenRewards += _calculateTokenRewards(tokenStakings[i]);
        }
        
        return UserStakingInfo({
            nftStakings: nftStakings,
            tokenStakings: tokenStakings,
            totalPendingRewards: nftRewards + tokenRewards,
            nftPendingRewards: nftRewards,
            tokenPendingRewards: tokenRewards
        });
    }
    
    /**
     * @notice Emergency function to recover staked NFTs (owner only)
     * @dev Properly cleans up staking arrays to prevent state inconsistencies
     * @param tokenId The ID of the NFT to recover
     * @param to The address to send the NFT to
     */
    function emergencyNFTRecovery(uint256 tokenId, address to) external onlyOwner {
        require(nftStaker[tokenId] != address(0), "NFT not staked");

        address staker = nftStaker[tokenId];
        uint256 stakingIndex = nftStakingIndex[tokenId];
        NFTStakingInfo[] storage stakings = userNFTStakings[staker];

        // Remove from staking array (swap with last element)
        if (stakingIndex != stakings.length - 1) {
            stakings[stakingIndex] = stakings[stakings.length - 1];
            nftStakingIndex[stakings[stakingIndex].tokenId] = stakingIndex;
        }
        stakings.pop();

        delete nftStaker[tokenId];
        delete nftStakingIndex[tokenId];

        portfolioNFT.transferFrom(address(this), to, tokenId);
    }

    /// @notice Current reward rate per second (modifiable by owner)
    uint256 public rewardRatePerSecond = REWARD_RATE_PER_SECOND;

    /**
     * @notice Updates the reward rate (owner only)
     * @param newRate The new reward rate per second
     */
    function updateRewardRate(uint256 newRate) external onlyOwner {
        rewardRatePerSecond = newRate;
    }
}