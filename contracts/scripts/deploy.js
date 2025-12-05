const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment on Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Object to store all deployed addresses
  const deployedAddresses = {};

  // 1. Deploy PortfolioToken
  console.log("1️⃣  Deploying PortfolioToken...");
  const PortfolioToken = await hre.ethers.getContractFactory("PortfolioToken");
  const portfolioToken = await PortfolioToken.deploy();
  await portfolioToken.waitForDeployment();
  const tokenAddress = await portfolioToken.getAddress();
  deployedAddresses.PORTFOLIO_TOKEN = tokenAddress;
  console.log("   ✅ PortfolioToken deployed to:", tokenAddress);

  // 2. Deploy PortfolioNFT
  console.log("\n2️⃣  Deploying PortfolioNFT...");
  const PortfolioNFT = await hre.ethers.getContractFactory("PortfolioNFT");
  const portfolioNFT = await PortfolioNFT.deploy();
  await portfolioNFT.waitForDeployment();
  const nftAddress = await portfolioNFT.getAddress();
  deployedAddresses.PORTFOLIO_NFT = nftAddress;
  console.log("   ✅ PortfolioNFT deployed to:", nftAddress);

  // 3. Deploy StakingManager
  console.log("\n3️⃣  Deploying StakingManager...");
  const StakingManager = await hre.ethers.getContractFactory("StakingManager");
  // IMPORTANT: Constructor expects (nftAddress, tokenAddress) in that order!
  const stakingManager = await StakingManager.deploy(nftAddress, tokenAddress);
  await stakingManager.waitForDeployment();
  const stakingAddress = await stakingManager.getAddress();
  deployedAddresses.STAKING_MANAGER = stakingAddress;
  console.log("   ✅ StakingManager deployed to:", stakingAddress);

  // 4. Deploy NFTMarketplace
  console.log("\n4️⃣  Deploying NFTMarketplace...");
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  // IMPORTANT: Constructor expects (nftAddress, tokenAddress) in that order!
  const marketplace = await NFTMarketplace.deploy(nftAddress, tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  deployedAddresses.NFT_MARKETPLACE = marketplaceAddress;
  console.log("   ✅ NFTMarketplace deployed to:", marketplaceAddress);

  // 5. Deploy PFTFaucet
  console.log("\n5️⃣  Deploying PFTFaucet...");
  const PFTFaucet = await hre.ethers.getContractFactory("PFTFaucet");
  const faucet = await PFTFaucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  deployedAddresses.PFT_FAUCET = faucetAddress;
  console.log("   ✅ PFTFaucet deployed to:", faucetAddress);

  // Configuration
  console.log("\n⚙️  Configuring contracts...");

  // Set faucet contract in PortfolioToken
  console.log("   Setting faucet contract in PortfolioToken...");
  const setFaucetTx = await portfolioToken.setFaucetContract(faucetAddress);
  await setFaucetTx.wait();
  console.log("   ✅ Faucet contract set");

  // Set staking contract in PortfolioToken
  console.log("   Setting staking contract in PortfolioToken...");
  const setStakingTx = await portfolioToken.setStakingContract(stakingAddress);
  await setStakingTx.wait();
  console.log("   ✅ Staking contract set");


  // Activate faucet
  console.log("   Activating faucet...");
  const activateTx = await faucet.setFaucetStatus(true);
  await activateTx.wait();
  console.log("   ✅ Faucet activated");

  // Transfer NFT ownership to marketplace so it can mint NFTs
  console.log("   Transferring NFT ownership to Marketplace...");
  const transferOwnershipTx = await portfolioNFT.transferOwnership(marketplaceAddress);
  await transferOwnershipTx.wait();
  console.log("   ✅ NFT ownership transferred to Marketplace");

  // Save addresses to JSON file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, "sepolia.json");
  const deploymentData = {
    network: "sepolia",
    chainId: 11155111,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: deployedAddresses
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  console.log("\n💾 Deployment addresses saved to:", deploymentFile);

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployed Contracts:");
  console.log("   PortfolioToken:  ", tokenAddress);
  console.log("   PortfolioNFT:    ", nftAddress);
  console.log("   StakingManager:  ", stakingAddress);
  console.log("   NFTMarketplace:  ", marketplaceAddress);
  console.log("   PFTFaucet:       ", faucetAddress);
  console.log("\n⏭️  Next steps:");
  console.log("   1. Run: npm run verify");
  console.log("   2. Update frontend with new addresses");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
