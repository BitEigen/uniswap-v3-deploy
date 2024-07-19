import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
import { deployToken } from "../src/deploy";

async function deployTokens(_taskArg: {}, hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();

  const usdtArtifact = await hre.artifacts.readArtifact("Tether")
  const usdtContract = await deployToken(usdtArtifact, signer);
  await usdtContract.waitForDeployment();
  console.log("USDT deployed to:", await usdtContract.getAddress());

  const usdcArtifact = await hre.artifacts.readArtifact("USDCoin")
  const usdcContract = await deployToken(usdcArtifact, signer);
  await usdcContract.waitForDeployment();
  console.log("USDC deployed to:", await usdcContract.getAddress());
}

task("deployTokens", "deploy usdt, usdc")
  .setAction(deployTokens);

