// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PortfolioToken
 * @author SE
 * @notice ERC20 token for the Portfolio DApp ecosystem
 * @dev Implements controlled minting through authorized contracts (Faucet and Staking)
 * This token is used as the primary currency for NFT purchases and staking rewards
 */
contract PortfolioToken is ERC20, Ownable, ReentrancyGuard {
    /// @notice Address of the authorized faucet contract
    address public faucetContract;

    /// @notice Address of the authorized staking contract
    address public stakingContract;

    /// @notice Emitted when the faucet contract address is updated
    /// @param newFaucet The new faucet contract address
    event FaucetContractUpdated(address indexed newFaucet);

    /// @notice Emitted when the staking contract address is updated
    /// @param newStaking The new staking contract address
    event StakingContractUpdated(address indexed newStaking);

    /**
     * @notice Initializes the Portfolio Token with initial supply
     * @dev Sets the token name to "Portfolio Token" and symbol to "PFT"
     * Mints 1 million tokens to the deployer
     */
    constructor() ERC20("Portfolio Token", "PFT") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10**18); // 1 million tokens
    }

    /**
     * @notice Mints new tokens (owner only)
     * @dev Used for initial distribution and contract setup
     * @param to The address to receive the minted tokens
     * @param amount The amount of tokens to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burns tokens from an address (owner only)
     * @dev Used for token management
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn (in wei)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /**
     * @notice Sets the authorized faucet contract address
     * @dev Only the faucet contract can call faucetMint
     * @param _faucetContract The address of the faucet contract
     */
    function setFaucetContract(address _faucetContract) external onlyOwner {
        require(_faucetContract != address(0), "Invalid faucet address");
        faucetContract = _faucetContract;
        emit FaucetContractUpdated(_faucetContract);
    }

    /**
     * @notice Sets the authorized staking contract address
     * @dev Only the staking contract can call stakingMint
     * @param _stakingContract The address of the staking contract
     */
    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid staking address");
        stakingContract = _stakingContract;
        emit StakingContractUpdated(_stakingContract);
    }

    /**
     * @notice Mints tokens through the faucet system
     * @dev Can only be called by the authorized faucet contract
     * @param to The address to receive the tokens
     * @param amount The amount of tokens to mint (in wei)
     */
    function faucetMint(address to, uint256 amount) external {
        require(msg.sender == faucetContract, "Only faucet can mint");
        require(to != address(0), "Invalid recipient");
        _mint(to, amount);
    }

    /**
     * @notice Mints tokens as staking rewards
     * @dev Can only be called by the authorized staking contract
     * @param to The address to receive the tokens
     * @param amount The amount of tokens to mint (in wei)
     */
    function stakingMint(address to, uint256 amount) external {
        require(msg.sender == stakingContract, "Only staking can mint");
        require(to != address(0), "Invalid recipient");
        _mint(to, amount);
    }
}