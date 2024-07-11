import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployWETH9 } from "../src/deploy";
import { task } from "hardhat/config";

async function deployWETH9Task(_taskArg: {}, hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();

  const contract = await deployWETH9(signer)
  console.log("WETH9 deployed to:", await contract.getAddress())
}

task("deploy-weth9", "deploy weth9")
  .setAction(deployWETH9Task);
