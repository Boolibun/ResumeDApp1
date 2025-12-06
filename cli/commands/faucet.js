import chalk from 'chalk';
import ora from 'ora';
import { formatTokens } from '../utils/contracts.js';

/**
 * Claim tokens from the faucet
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function claimFaucet(contracts, address) {
  console.log(chalk.cyan('\n💧 Faucet - Claim Free Tokens\n'));

  try {
    // Check if user can claim
    const canClaim = await contracts.faucet.canClaim(address);

    if (!canClaim) {
      const timeUntilNext = await contracts.faucet.getTimeUntilNextClaim(address);
      const waitTime = Number(timeUntilNext);

      const hours = Math.floor(waitTime / 3600);
      const minutes = Math.floor((waitTime % 3600) / 60);

      console.log(chalk.yellow(`⏳ You must wait ${hours}h ${minutes}m before claiming again.\n`));
      return;
    }

    // Get faucet amount
    const faucetAmount = await contracts.faucet.FAUCET_AMOUNT();

    console.log(chalk.green(`✨ You can claim ${formatTokens(faucetAmount)} PFT tokens!\n`));

    // Send claim transaction
    const spinner = ora('Sending claim transaction...').start();

    const tx = await contracts.faucet.claimTokens();
    spinner.text = 'Waiting for confirmation...';

    const receipt = await tx.wait();

    spinner.succeed(chalk.green(`Successfully claimed ${formatTokens(faucetAmount)} PFT!`));

    console.log(chalk.gray(`\n📝 Transaction hash: ${receipt.hash}`));
    console.log(chalk.gray(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}\n`));

    // Show updated balance
    const newBalance = await contracts.portfolioToken.balanceOf(address);
    console.log(chalk.cyan(`💰 New balance: ${formatTokens(newBalance)} PFT\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error claiming from faucet: ${error.message}\n`));
    if (error.reason) {
      console.log(chalk.yellow(`Reason: ${error.reason}\n`));
    }
  }
}

/**
 * Check faucet status
 * @param {Object} contracts - Contract instances
 * @param {string} address - User address
 */
export async function checkFaucetStatus(contracts, address) {
  console.log(chalk.cyan('\n💧 Faucet Status\n'));

  try {
    const canClaim = await contracts.faucet.canClaim(address);
    const faucetAmount = await contracts.faucet.FAUCET_AMOUNT();
    const cooldownPeriod = await contracts.faucet.COOLDOWN_PERIOD();

    console.log(chalk.white(`Faucet Amount: ${formatTokens(faucetAmount)} PFT`));
    console.log(chalk.white(`Cooldown Period: ${Number(cooldownPeriod) / 3600} hours`));

    if (canClaim) {
      console.log(chalk.green('\n✅ You can claim tokens now!\n'));
    } else {
      const timeUntilNext = await contracts.faucet.getTimeUntilNextClaim(address);
      const nextClaimTime = Math.floor(Date.now() / 1000) + Number(timeUntilNext);
      const nextClaimDate = new Date(nextClaimTime * 1000).toLocaleString();

      console.log(chalk.yellow(`\n⏳ Next claim available at: ${nextClaimDate}\n`));
    }

  } catch (error) {
    console.log(chalk.red(`\n❌ Error checking faucet status: ${error.message}\n`));
  }
}
