const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Portfolio DApp", function () {
  let portfolioToken, portfolioNFT, stakingManager, nftMarketplace;
  let owner, user1, user2;
  
  async function deployContracts() {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy PortfolioToken
    const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
    portfolioToken = await PortfolioToken.deploy();
    
    // Deploy PortfolioNFT
    const PortfolioNFT = await ethers.getContractFactory("PortfolioNFT");
    portfolioNFT = await PortfolioNFT.deploy();
    
    // Deploy StakingManager
    const StakingManager = await ethers.getContractFactory("StakingManager");
    stakingManager = await StakingManager.deploy(
      await portfolioNFT.getAddress(),
      await portfolioToken.getAddress()
    );
    
    // Deploy NFTMarketplace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy(
      await portfolioNFT.getAddress(),
      await portfolioToken.getAddress()
    );
  }
  
  describe("PortfolioNFT", function () {
    beforeEach(async function () {
      await deployContracts();
    });
    
    it("Should allow initial claim", async function () {
      await portfolioNFT.connect(user1).initialClaim();
      expect(await portfolioNFT.balanceOf(user1.address)).to.equal(1);
      expect(await portfolioNFT.hasClaimed(user1.address)).to.be.true;
    });
    
    it("Should not allow second claim", async function () {
      await portfolioNFT.connect(user1).initialClaim();
      await expect(
        portfolioNFT.connect(user1).initialClaim()
      ).to.be.revertedWith("Already claimed initial NFT");
    });
    
    it("Should return correct NFT metadata", async function () {
      const metadata = await portfolioNFT.getNFTMetadata(1);
      expect(metadata.title).to.equal("First Smart Contract");
      expect(metadata.rarity).to.equal(0); // Common = 0
    });
  });
  
  describe("StakingManager", function () {
    beforeEach(async function () {
      await deployContracts();
      // Transfer ownership to staking manager for minting tokens
      await portfolioToken.transferOwnership(await stakingManager.getAddress());
      // User1 claims initial NFT
      await portfolioNFT.connect(user1).initialClaim();
    });
    
    it("Should allow staking NFT", async function () {
      const tokenId = 1;
      await portfolioNFT.connect(user1).approve(await stakingManager.getAddress(), tokenId);
      await stakingManager.connect(user1).stake(tokenId);
      
      const stakingInfo = await stakingManager.getStakingInfo(user1.address);
      expect(stakingInfo.length).to.equal(1);
      expect(stakingInfo[0].tokenId).to.equal(tokenId);
    });
    
    it("Should calculate rewards correctly", async function () {
      const tokenId = 1;
      await portfolioNFT.connect(user1).approve(await stakingManager.getAddress(), tokenId);
      await stakingManager.connect(user1).stake(tokenId);
      
      // Fast forward time by 1 day (86400 seconds)
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      const pendingRewards = await stakingManager.getPendingRewards(user1.address);
      // Common NFT should generate 1 token per day - allowing for slight time differences
      expect(pendingRewards).to.be.closeTo(ethers.parseEther("1"), ethers.parseEther("0.01"));
    });
    
    it("Should allow claiming rewards", async function () {
      const tokenId = 1;
      await portfolioNFT.connect(user1).approve(await stakingManager.getAddress(), tokenId);
      await stakingManager.connect(user1).stake(tokenId);
      
      // Fast forward time by 1 day
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      await stakingManager.connect(user1).claimRewards();
      const balance = await portfolioToken.balanceOf(user1.address);
      expect(balance).to.be.closeTo(ethers.parseEther("1"), ethers.parseEther("0.01"));
    });
    
    it("Should allow unstaking NFT", async function () {
      const tokenId = 1;
      await portfolioNFT.connect(user1).approve(await stakingManager.getAddress(), tokenId);
      await stakingManager.connect(user1).stake(tokenId);
      
      await stakingManager.connect(user1).unstake(tokenId);
      
      expect(await portfolioNFT.ownerOf(tokenId)).to.equal(user1.address);
      const stakingInfo = await stakingManager.getStakingInfo(user1.address);
      expect(stakingInfo.length).to.equal(0);
    });
  });
  
  describe("PortfolioToken", function () {
    beforeEach(async function () {
      await deployContracts();
    });
    
    it("Should allow free mint of 100 tokens", async function () {
      await portfolioToken.connect(user1).claimFreeMint();
      const balance = await portfolioToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("100"));
      expect(await portfolioToken.hasClaimedFreeMint(user1.address)).to.be.true;
    });
    
    it("Should not allow second free mint", async function () {
      await portfolioToken.connect(user1).claimFreeMint();
      await expect(
        portfolioToken.connect(user1).claimFreeMint()
      ).to.be.revertedWith("Already claimed free mint");
    });
    
    it("Should allow multiple users to claim", async function () {
      await portfolioToken.connect(user1).claimFreeMint();
      await portfolioToken.connect(user2).claimFreeMint();
      
      expect(await portfolioToken.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
      expect(await portfolioToken.balanceOf(user2.address)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("NFTMarketplace", function () {
    beforeEach(async function () {
      await deployContracts();
      // Transfer NFT ownership to marketplace for minting
      await portfolioNFT.transferOwnership(await nftMarketplace.getAddress());
      // Transfer token ownership to marketplace for burning
      await portfolioToken.transferOwnership(await nftMarketplace.getAddress());
    });
    
    it("Should return correct NFT prices", async function () {
      const [price, available] = await nftMarketplace.getNFTPrice(2);
      expect(price).to.equal(ethers.parseEther("50"));
      expect(available).to.be.true;
    });
    
    it("Should get available NFTs list", async function () {
      const [nftIds, prices] = await nftMarketplace.getAvailableNFTs();
      expect(nftIds.length).to.be.greaterThan(0);
      expect(prices.length).to.equal(nftIds.length);
    });
  });
});