// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PortfolioNFT.sol";
import "./PortfolioToken.sol";

/**
 * @title NFTMarketplace
 * @notice Marketplace for purchasing Portfolio NFTs with PFT tokens
 * @dev Implements NFT purchasing system with token payments and ownership verification
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    PortfolioNFT public portfolioNFT;
    PortfolioToken public portfolioToken;
    
    struct NFTPrice {
        uint256 price;
        bool available;
    }
    
    mapping(uint256 => NFTPrice) public nftPrices;
    mapping(address => mapping(uint256 => bool)) public userPurchases;
    
    event NFTPurchased(address indexed buyer, uint256 indexed nftId, uint256 price);
    event PriceUpdated(uint256 indexed nftId, uint256 newPrice);
    event TokensWithdrawn(address indexed owner, uint256 amount);
    
    constructor(address _portfolioNFT, address _portfolioToken) Ownable(msg.sender) {
        portfolioNFT = PortfolioNFT(_portfolioNFT);
        portfolioToken = PortfolioToken(_portfolioToken);
        
        _initializePrices();
    }
    
    /**
     * @notice Initializes prices for all NFTs
     * @dev Called once during contract deployment
     */
    function _initializePrices() private {
        // NFT #1: IT Support Technician (Common) - Free
        nftPrices[1] = NFTPrice(0, true);

        // NFT #2: Full-Stack Designer & Developer (Rare) - 50 PFT
        nftPrices[2] = NFTPrice(50 ether, true);

        // NFT #3: Technical Lead / Blockchain Developer (Epic) - 150 PFT
        nftPrices[3] = NFTPrice(150 ether, true);
    }

    /**
     * @notice Purchase a specific NFT with PFT tokens
     * @param nftId The ID of the NFT to purchase
     */
    function purchaseNFT(uint256 nftId) external nonReentrant {
        require(nftPrices[nftId].available, "NFT not available for purchase");
        
        // Check if user already owns this NFT
        try portfolioNFT.ownerOf(nftId) returns (address currentOwner) {
            require(currentOwner != msg.sender, "You already own this NFT");
        } catch {
            // NFT doesn't exist yet, that's fine
        }
        
        uint256 price = nftPrices[nftId].price;
        require(portfolioToken.balanceOf(msg.sender) >= price, "Insufficient tokens");
        
        // Transfer tokens from user to this contract (marketplace collects them)
        if (price > 0) {
            portfolioToken.transferFrom(msg.sender, address(this), price);
        }
        
        // Mark as purchased
        userPurchases[msg.sender][nftId] = true;
        
        // Mint NFT
        portfolioNFT.mintNFT(msg.sender, nftId);
        
        emit NFTPurchased(msg.sender, nftId, price);
    }

    /**
     * @notice Update the price and availability of an NFT (owner only)
     * @param nftId The ID of the NFT
     * @param newPrice The new price in wei
     * @param available Whether the NFT is available for purchase
     */
    function updatePrice(uint256 nftId, uint256 newPrice, bool available) external onlyOwner {
        nftPrices[nftId] = NFTPrice(newPrice, available);
        emit PriceUpdated(nftId, newPrice);
    }

    /**
     * @notice Get the price and availability of an NFT
     * @param nftId The ID of the NFT
     * @return price The price in wei
     * @return available Whether the NFT is available for purchase
     */
    function getNFTPrice(uint256 nftId) external view returns (uint256, bool) {
        NFTPrice memory priceInfo = nftPrices[nftId];
        return (priceInfo.price, priceInfo.available);
    }

    /**
     * @notice Check if a user has purchased a specific NFT
     * @param user The address to check
     * @param nftId The ID of the NFT
     * @return Whether the user has purchased the NFT
     */
    function hasUserPurchased(address user, uint256 nftId) external view returns (bool) {
        return userPurchases[user][nftId];
    }
    
    /**
     * @notice Returns all available NFTs for purchase
     * @return Array of NFT IDs and their prices
     */
    function getAvailableNFTs() external view returns (uint256[] memory, uint256[] memory) {
        uint256[] memory nftIds = new uint256[](3); // NFTs 1-3
        uint256[] memory prices = new uint256[](3);

        uint256 index = 0;
        for (uint256 i = 1; i <= 3; i++) {
            if (nftPrices[i].available) {
                nftIds[index] = i;
                prices[index] = nftPrices[i].price;
                index++;
            }
        }
        
        // Resize arrays to actual length
        uint256[] memory finalNftIds = new uint256[](index);
        uint256[] memory finalPrices = new uint256[](index);
        
        for (uint256 i = 0; i < index; i++) {
            finalNftIds[i] = nftIds[i];
            finalPrices[i] = prices[i];
        }
        
        return (finalNftIds, finalPrices);
    }
    
    /**
     * @notice Withdraws collected tokens from sales (owner only)
     */
    function withdrawTokens() external onlyOwner {
        uint256 balance = portfolioToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        portfolioToken.transfer(owner(), balance);

        emit TokensWithdrawn(owner(), balance);
    }

    /**
     * @notice Returns the token balance of this contract
     * @return The contract's token balance
     */
    function getContractTokenBalance() external view returns (uint256) {
        return portfolioToken.balanceOf(address(this));
    }

    // ========== BATCH PURCHASE FUNCTIONS ==========

    /**
     * @notice Purchases multiple NFTs in a single transaction
     * @param nftIds Array of NFT IDs to purchase
     */
    function purchaseMultipleNFTs(uint256[] calldata nftIds) external nonReentrant {
        require(nftIds.length > 0, "No NFTs to purchase");
        require(nftIds.length <= 5, "Too many NFTs"); // Gas limit

        uint256 totalPrice = 0;

        // Calculate total price and verify availability
        for (uint256 i = 0; i < nftIds.length; i++) {
            uint256 nftId = nftIds[i];
            require(nftPrices[nftId].available, "NFT not available for purchase");
            
            // Check if user already owns this NFT
            try portfolioNFT.ownerOf(nftId) returns (address currentOwner) {
                require(currentOwner != msg.sender, "You already own this NFT");
            } catch {
                // NFT doesn't exist yet, that's fine
            }
            
            totalPrice += nftPrices[nftId].price;
        }

        require(portfolioToken.balanceOf(msg.sender) >= totalPrice, "Insufficient tokens");

        // Execute all purchases
        if (totalPrice > 0) {
            portfolioToken.transferFrom(msg.sender, address(this), totalPrice);
        }

        for (uint256 i = 0; i < nftIds.length; i++) {
            uint256 nftId = nftIds[i];
            userPurchases[msg.sender][nftId] = true;
            portfolioNFT.mintNFT(msg.sender, nftId);
            
            emit NFTPurchased(msg.sender, nftId, nftPrices[nftId].price);
        }
    }
    
    /// @notice Struct containing all marketplace information for a user
    struct MarketplaceInfo {
        uint256[] availableNFTs;
        uint256[] prices;
        bool[] alreadyPurchased;
        uint256[] alreadyOwned;
        uint256 userTokenBalance;
    }
    
    /**
     * @notice Returns comprehensive marketplace information for a user
     * @param user The address to query
     * @return MarketplaceInfo struct with all relevant data
     */
    function getMarketplaceInfo(address user) external view returns (MarketplaceInfo memory) {
        uint256[] memory tempNFTs = new uint256[](2);
        uint256[] memory tempPrices = new uint256[](2);
        bool[] memory tempPurchased = new bool[](2);

        uint256 count = 0;
        for (uint256 i = 2; i <= 3; i++) {
            if (nftPrices[i].available) {
                tempNFTs[count] = i;
                tempPrices[count] = nftPrices[i].price;
                tempPurchased[count] = userPurchases[user][i];
                count++;
            }
        }

        // Resize arrays
        uint256[] memory availableNFTs = new uint256[](count);
        uint256[] memory prices = new uint256[](count);
        bool[] memory alreadyPurchased = new bool[](count);

        for (uint256 i = 0; i < count; i++) {
            availableNFTs[i] = tempNFTs[i];
            prices[i] = tempPrices[i];
            alreadyPurchased[i] = tempPurchased[i];
        }

        // NFTs already owned by user
        uint256[] memory alreadyOwned = portfolioNFT.getOwnedTokens(user);
        
        return MarketplaceInfo({
            availableNFTs: availableNFTs,
            prices: prices,
            alreadyPurchased: alreadyPurchased,
            alreadyOwned: alreadyOwned,
            userTokenBalance: portfolioToken.balanceOf(user)
        });
    }
    
    /**
     * @notice Checks if a user can purchase a specific NFT
     * @param user The address to check
     * @param nftId The ID of the NFT
     * @return bool Whether the purchase is possible
     * @return string Reason if purchase is not possible
     */
    function canPurchaseNFT(address user, uint256 nftId) external view returns (bool, string memory) {
        if (!nftPrices[nftId].available) {
            return (false, "NFT not available for purchase");
        }

        // Check if user already owns the NFT
        try portfolioNFT.ownerOf(nftId) returns (address owner) {
            if (owner == user) {
                return (false, "Already owns this NFT");
            }
        } catch {
            // NFT not yet minted, that's OK
        }

        if (portfolioToken.balanceOf(user) < nftPrices[nftId].price) {
            return (false, "Insufficient tokens");
        }

        return (true, "Can purchase");
    }

    /**
     * @notice Batch update prices for multiple NFTs (owner only)
     * @param nftIds Array of NFT IDs
     * @param newPrices Array of new prices
     * @param availability Array of availability statuses
     */
    function updateMultiplePrices(
        uint256[] calldata nftIds,
        uint256[] calldata newPrices,
        bool[] calldata availability
    ) external onlyOwner {
        require(nftIds.length == newPrices.length && newPrices.length == availability.length, "Array lengths mismatch");
        
        for (uint256 i = 0; i < nftIds.length; i++) {
            nftPrices[nftIds[i]] = NFTPrice(newPrices[i], availability[i]);
            emit PriceUpdated(nftIds[i], newPrices[i]);
        }
    }
    
    /// @notice Struct containing marketplace statistics
    struct MarketplaceStats {
        uint256 totalSales;
        uint256 totalRevenue;
        uint256 availableNFTCount;
        uint256 contractBalance;
    }
    
    /**
     * @notice Returns marketplace statistics
     * @return MarketplaceStats struct with aggregated data
     */
    function getMarketplaceStats() external view returns (MarketplaceStats memory) {
        uint256 availableCount = 0;
        for (uint256 i = 2; i <= 3; i++) {
            if (nftPrices[i].available) {
                availableCount++;
            }
        }
        
        // Note: For actual sales tracking, additional state variables would be needed
        return MarketplaceStats({
            totalSales: 0, // To implement with persistent counter
            totalRevenue: 0, // To implement with persistent counter
            availableNFTCount: availableCount,
            contractBalance: portfolioToken.balanceOf(address(this))
        });
    }
}