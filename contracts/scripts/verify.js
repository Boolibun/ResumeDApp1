const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification on Etherscan...\n");

  // Load deployment addresses
  const deploymentFile = path.join(__dirname, "..", "deployments", "sepolia.json");

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found:", deploymentFile);
    console.log("   Please run deployment first: npm run deploy");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const addresses = deployment.contracts;

  console.log("📋 Loaded deployment from:", deploymentFile);
  console.log("   Network:", deployment.network);
  console.log("   Deployed at:", deployment.deployedAt);
  console.log();

  let successCount = 0;
  let errorCount = 0;

  // 1. Verify PortfolioToken
  console.log("1️⃣  Verifying PortfolioToken...");
  try {
    await hre.run("verify:verify", {
      address: addresses.PORTFOLIO_TOKEN,
      constructorArguments: [],
    });
    console.log("   ✅ PortfolioToken verified");
    successCount++;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ℹ️  Already verified");
      successCount++;
    } else {
      console.log("   ❌ Error:", error.message);
      errorCount++;
    }
  }

  // 2. Verify PortfolioNFT
  console.log("\n2️⃣  Verifying PortfolioNFT...");
  try {
    await hre.run("verify:verify", {
      address: addresses.PORTFOLIO_NFT,
      constructorArguments: [],
    });
    console.log("   ✅ PortfolioNFT verified");
    successCount++;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ℹ️  Already verified");
      successCount++;
    } else {
      console.log("   ❌ Error:", error.message);
      errorCount++;
    }
  }

  // 3. Verify StakingManager
  console.log("\n3️⃣  Verifying StakingManager...");
  try {
    await hre.run("verify:verify", {
      address: addresses.STAKING_MANAGER,
      constructorArguments: [
        addresses.PORTFOLIO_NFT,
        addresses.PORTFOLIO_TOKEN
      ],
    });
    console.log("   ✅ StakingManager verified");
    successCount++;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ℹ️  Already verified");
      successCount++;
    } else {
      console.log("   ❌ Error:", error.message);
      errorCount++;
    }
  }

  // 4. Verify NFTMarketplace
  console.log("\n4️⃣  Verifying NFTMarketplace...");
  try {
    await hre.run("verify:verify", {
      address: addresses.NFT_MARKETPLACE,
      constructorArguments: [
        addresses.PORTFOLIO_TOKEN,
        addresses.PORTFOLIO_NFT
      ],
    });
    console.log("   ✅ NFTMarketplace verified");
    successCount++;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ℹ️  Already verified");
      successCount++;
    } else {
      console.log("   ❌ Error:", error.message);
      errorCount++;
    }
  }

  // 5. Verify PFTFaucet
  console.log("\n5️⃣  Verifying PFTFaucet...");
  try {
    await hre.run("verify:verify", {
      address: addresses.PFT_FAUCET,
      constructorArguments: [addresses.PORTFOLIO_TOKEN],
    });
    console.log("   ✅ PFTFaucet verified");
    successCount++;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("   ℹ️  Already verified");
      successCount++;
    } else {
      console.log("   ❌ Error:", error.message);
      errorCount++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 VERIFICATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors:  ${errorCount}`);
  console.log("\n🔗 View on Etherscan:");
  console.log("   PortfolioToken:  ", `https://sepolia.etherscan.io/address/${addresses.PORTFOLIO_TOKEN}`);
  console.log("   PortfolioNFT:    ", `https://sepolia.etherscan.io/address/${addresses.PORTFOLIO_NFT}`);
  console.log("   StakingManager:  ", `https://sepolia.etherscan.io/address/${addresses.STAKING_MANAGER}`);
  console.log("   NFTMarketplace:  ", `https://sepolia.etherscan.io/address/${addresses.NFT_MARKETPLACE}`);
  console.log("   PFTFaucet:       ", `https://sepolia.etherscan.io/address/${addresses.PFT_FAUCET}`);
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
