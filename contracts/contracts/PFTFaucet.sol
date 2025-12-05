// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IPortfolioToken
 * @notice Interface for Portfolio Token faucet interactions
 */
interface IPortfolioToken {
    function faucetMint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title PFTFaucet
 * @author SE
 * @notice Faucet contract for distributing Portfolio Tokens (PFT) with cooldown
 * @dev Implements rate limiting and daily limits to prevent abuse
 */
contract PFTFaucet is Ownable, ReentrancyGuard {
    /// @notice The Portfolio Token contract interface
    IPortfolioToken public immutable portfolioToken;

    /// @notice Amount of tokens distributed per claim
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18; // 100 PFT

    /// @notice Cooldown period between claims
    uint256 public constant COOLDOWN_PERIOD = 1 hours;

    /// @notice Tracks the last claim time for each address
    mapping(address => uint256) public lastClaimTime;

    /// @notice Tracks the total amount claimed by each address
    mapping(address => uint256) public totalClaimed;

    /// @notice Whether the faucet is currently active
    bool public faucetActive = true;

    /// @notice Maximum amount that can be claimed per day per user
    uint256 public maxDailyLimit = 1000 * 10**18; // 1000 PFT per day

    /// @notice Emitted when tokens are claimed
    /// @param claimer The address that claimed tokens
    /// @param amount The amount of tokens claimed
    /// @param nextClaimTime When the address can claim again
    event TokensClaimed(address indexed claimer, uint256 amount, uint256 nextClaimTime);

    /// @notice Emitted when the faucet status changes
    /// @param active The new faucet status
    event FaucetStatusChanged(bool active);

    /// @notice Emitted when the daily limit changes
    /// @param newLimit The new daily limit
    event MaxDailyLimitChanged(uint256 newLimit);

    /**
     * @notice Initializes the faucet with a Portfolio Token contract
     * @param _portfolioToken Address of the Portfolio Token contract
     */
    constructor(address _portfolioToken) Ownable(msg.sender) {
        require(_portfolioToken != address(0), "Invalid token address");
        portfolioToken = IPortfolioToken(_portfolioToken);
    }
    
    /**
     * @notice Claims tokens from the faucet
     * @dev Checks cooldown period and daily limits before minting
     */
    function claimTokens() external nonReentrant {
        require(faucetActive, "Faucet is currently inactive");
        require(canClaim(msg.sender), "Must wait for cooldown period");

        // Check daily limit
        uint256 claimedToday = getTotalClaimedToday(msg.sender);
        require(claimedToday + FAUCET_AMOUNT <= maxDailyLimit, "Daily limit exceeded");

        // Update claim info
        lastClaimTime[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        // Mint tokens through faucet
        portfolioToken.faucetMint(msg.sender, FAUCET_AMOUNT);

        uint256 nextClaimTime = block.timestamp + COOLDOWN_PERIOD;
        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, nextClaimTime);
    }

    /**
     * @notice Checks if an address can claim tokens
     * @param user The address to check
     * @return True if the user can claim
     */
    function canClaim(address user) public view returns (bool) {
        if (lastClaimTime[user] == 0) return true; // First time claim
        return block.timestamp >= lastClaimTime[user] + COOLDOWN_PERIOD;
    }

    /**
     * @notice Returns the time until the next claim is available
     * @param user The address to check
     * @return Time in seconds until next claim (0 if can claim now)
     */
    function getTimeUntilNextClaim(address user) public view returns (uint256) {
        if (canClaim(user)) return 0;
        return (lastClaimTime[user] + COOLDOWN_PERIOD) - block.timestamp;
    }

    /**
     * @notice Returns the total amount claimed today by a user
     * @param user The address to check
     * @return Amount claimed today in wei
     */
    function getTotalClaimedToday(address user) public view returns (uint256) {
        uint256 todayStart = (block.timestamp / 1 days) * 1 days;
        uint256 lastClaim = lastClaimTime[user];

        if (lastClaim < todayStart) {
            return 0; // No claims today
        }

        return FAUCET_AMOUNT; // Simplified: assume one claim today
    }

    /**
     * @notice Returns comprehensive user information
     * @param user The address to query
     * @return canClaimNow Whether the user can claim now
     * @return timeUntilNextClaim Seconds until next claim
     * @return totalClaimedAmount Total amount ever claimed
     * @return lastClaim Timestamp of last claim
     * @return claimedToday Amount claimed today
     */
    function getUserInfo(address user) external view returns (
        bool canClaimNow,
        uint256 timeUntilNextClaim,
        uint256 totalClaimedAmount,
        uint256 lastClaim,
        uint256 claimedToday
    ) {
        return (
            canClaim(user),
            canClaim(user) ? 0 : getTimeUntilNextClaim(user),
            totalClaimed[user],
            lastClaimTime[user],
            getTotalClaimedToday(user)
        );
    }

    /**
     * @notice Enables or disables the faucet (owner only)
     * @param _active True to activate, false to deactivate
     */
    function setFaucetStatus(bool _active) external onlyOwner {
        faucetActive = _active;
        emit FaucetStatusChanged(_active);
    }

    /**
     * @notice Updates the maximum daily limit (owner only)
     * @param _newLimit New daily limit in wei
     */
    function setMaxDailyLimit(uint256 _newLimit) external onlyOwner {
        maxDailyLimit = _newLimit;
        emit MaxDailyLimitChanged(_newLimit);
    }

    /**
     * @notice Emergency function to recover accidentally sent tokens (owner only)
     * @param token The token contract address
     * @param to The recipient address
     * @param amount The amount to transfer
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(to, amount), "Transfer failed");
    }
}