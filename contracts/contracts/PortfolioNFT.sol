// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PortfolioNFT
 * @author SE
 * @notice NFT collection representing professional experiences
 * @dev Each NFT represents a unique work experience with metadata and rarity
 */
contract PortfolioNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    /// @notice Mapping of token ID to its metadata
    mapping(uint256 => NFTMetadata) public nftMetadata;

    /// @notice Rarity levels for NFTs
    enum Rarity { Common, Rare, Epic, Legendary }

    /**
     * @notice Metadata structure for each NFT
     * @param title The title of the experience
     * @param description Short description
     * @param imageUri IPFS URI for the NFT image
     * @param rarity The rarity level of the NFT
     * @param tokenReward Daily reward rate for staking this NFT
     * @param exists Whether this NFT metadata exists
     */
    struct NFTMetadata {
        string title;
        string description;
        string imageUri;
        Rarity rarity;
        uint256 tokenReward;
        bool exists;
    }

    /// @notice Emitted when a new NFT is minted
    /// @param to The recipient of the NFT
    /// @param tokenId The ID of the minted NFT
    /// @param rarity The rarity of the minted NFT
    event NFTMinted(address indexed to, uint256 indexed tokenId, Rarity rarity);

    /**
     * @notice Initializes the Portfolio NFT collection
     * @dev Calls _initializeNFTs to set up metadata for all NFTs
     */
    constructor() ERC721("Portfolio Experience NFT", "PNFT") Ownable(msg.sender) {
        _initializeNFTs();
    }
    
    /**
     * @notice Initializes the metadata for all NFTs
     * @dev Called once during contract deployment
     */
    function _initializeNFTs() private {
        // NFT #1: IT Support Technician (Common) - Free
        nftMetadata[1] = NFTMetadata({
            title: "IT Support Technician",
            description: "Technical support for hospitals and pharmacies across France",
            imageUri: "https://jade-faithful-platypus-613.mypinata.cloud/ipfs/bafkreielv7j46od3awli4bkyt6uxbobees6bfirraxr3y6cwqqps27eiue",
            rarity: Rarity.Common,
            tokenReward: 1 ether,
            exists: true
        });

        // NFT #2: Full-Stack Designer & Developer (Rare) - 50 PFT
        nftMetadata[2] = NFTMetadata({
            title: "Full-Stack Designer & Developer",
            description: "Complete design and development of the WeDriive platform",
            imageUri: "https://jade-faithful-platypus-613.mypinata.cloud/ipfs/bafkreihrp6hsmoxpranx7vd6klzy655wb7wqbdbuk236ta4wiqayeo645q",
            rarity: Rarity.Rare,
            tokenReward: 3 ether,
            exists: true
        });

        // NFT #3: Technical Lead / Blockchain Developer (Epic) - 150 PFT
        nftMetadata[3] = NFTMetadata({
            title: "Technical Lead / Blockchain Developer",
            description: "Multi-chain bot development for secure and anonymous fund transfers",
            imageUri: "https://jade-faithful-platypus-613.mypinata.cloud/ipfs/bafkreihmogpule43jb6jgc6ncqz2v2mdjcrttysdnvrpj5uqwwubt6vgqa",
            rarity: Rarity.Epic,
            tokenReward: 5 ether,
            exists: true
        });
    }
    
    /**
     * @notice Mints a specific NFT to an address
     * @dev Only callable by owner (marketplace contract)
     * @param to The address to receive the NFT
     * @param nftId The ID of the NFT to mint (1-3)
     */
    function mintNFT(address to, uint256 nftId) external onlyOwner {
        require(nftMetadata[nftId].exists, "NFT metadata does not exist");
        require(nftId >= 1 && nftId <= 3, "Invalid NFT ID");
        require(_ownerOf(nftId) == address(0), "NFT already minted");

        _mint(to, nftId);

        emit NFTMinted(to, nftId, nftMetadata[nftId].rarity);
    }

    /**
     * @notice Returns the metadata for a specific NFT
     * @param nftId The ID of the NFT
     * @return The NFT metadata struct
     */
    function getNFTMetadata(uint256 nftId) external view returns (NFTMetadata memory) {
        require(nftMetadata[nftId].exists, "NFT metadata does not exist");
        return nftMetadata[nftId];
    }

    /**
     * @notice Returns the daily reward rate for a rarity level
     * @param rarity The rarity level
     * @return The daily reward in wei
     */
    function getRarityDailyReward(Rarity rarity) public pure returns (uint256) {
        if (rarity == Rarity.Common) return 1 ether;
        if (rarity == Rarity.Rare) return 3 ether;
        if (rarity == Rarity.Epic) return 5 ether;
        if (rarity == Rarity.Legendary) return 10 ether;
        return 0;
    }

    /**
     * @notice Returns the metadata URI for a token
     * @dev Returns IPFS URI even if NFT is not yet minted
     * @param tokenId The ID of the token
     * @return The IPFS URI string
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (tokenId == 1) {
            return "https://gateway.pinata.cloud/ipfs/QmbJ5wYo6a5vLGWtfq9grThFw2BVigp3MmjYBBk3475Y7t";
        } else if (tokenId == 2) {
            return "https://gateway.pinata.cloud/ipfs/QmZrXfPWdWK93xcdA8VJtr9pzCjWujqkLV6BuFKhbq16Qn";
        } else if (tokenId == 3) {
            return "https://gateway.pinata.cloud/ipfs/QmYGSemqPNDX6XSyFYQy9wfByvhXL5sFUTmCu8hB4bctWb";
        }

        revert("Invalid token ID");
    }

    /**
     * @notice Returns all NFT IDs owned by an address
     * @param owner The address to query
     * @return Array of owned token IDs
     */
    function getOwnedTokens(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory ownedTokens = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            ownedTokens[i] = tokenOfOwnerByIndex(owner, i);
        }

        return ownedTokens;
    }

    /**
     * @notice Returns metadata for multiple NFTs in a single call
     * @param tokenIds Array of token IDs to query
     * @return Array of NFT metadata structs
     */
    function getMultipleNFTMetadata(uint256[] calldata tokenIds) external view returns (NFTMetadata[] memory) {
        NFTMetadata[] memory metadataArray = new NFTMetadata[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            metadataArray[i] = nftMetadata[tokenIds[i]];
        }

        return metadataArray;
    }

    /**
     * @notice Checks if an NFT is available for minting
     * @param nftId The ID of the NFT to check
     * @return True if the NFT exists and hasn't been minted yet
     */
    function isAvailableForMint(uint256 nftId) external view returns (bool) {
        return nftMetadata[nftId].exists && _ownerOf(nftId) == address(0);
    }
    
    // Required overrides for ERC721Enumerable compatibility
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}