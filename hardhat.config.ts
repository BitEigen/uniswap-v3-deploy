import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "./tasks/index";

const DEFAULT_MNEMONIC = "test test test test test test test test test test test junk";
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("private key not found");
}

const config: HardhatUserConfig = {
  // solidity: "0.8.24",
  solidity: {
    compilers: [
      {
        version: "0.7.6",
      },
      {
        version: "0.4.18",
      },
    ]
  },
  networks: {
    hardhat: {
      initialDate: "0",
      allowUnlimitedContractSize: true,
      initialBaseFeePerGas: 0,
      accounts: [{
        privateKey: `0x${privateKey}`,
        balance: '1000000000000000000000'
      }],
      forking: {
        url: "https://rpc-testnet.biteigen.xyz",
        blockNumber: 371433
      }
    },
    biteigen: {
      url: "https://rpc-testnet.biteigen.xyz",
      chainId: 1022,
      accounts: [`0x${privateKey}`]
    },
    rsk: {
      url: "https://public-node.testnet.rsk.co",
      chainId: 31,
      accounts: [`0x${privateKey}`],
    },
  },
  etherscan: {
    apiKey: {
      biteigen: "apikey",
    },
    customChains: [
      {
        network: "biteigen",
        chainId: 1022,
        urls: {
          apiURL: "https://explorer-testnet.biteigen.xyz/api",
          browserURL: "https://explorer-testnet.biteigen.xyz/",
        }
      }
    ],
  },
};

export default config;

