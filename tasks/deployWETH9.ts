import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
import { deployWETH9 } from "../src/deploy";

async function deployWETH9Task(_taskArg: {}, hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();

  const artifact = await hre.artifacts.readArtifact("WETH9")
  const contract = await deployWETH9(artifact, signer);
  await contract.waitForDeployment();
  console.log("WETH9 deployed to:", await contract.getAddress());
}

task("deploy-weth9", "deploy weth9")
  .setAction(deployWETH9Task);
