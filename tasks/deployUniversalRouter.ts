import UniversalRouter from '@uniswap/universal-router/artifacts/contracts/UniversalRouter.sol/UniversalRouter.json';
import { task } from "hardhat/config";
import { Artifact, HardhatRuntimeEnvironment } from "hardhat/types";
import Biteigen from '../biteigen.json';
import Permit2 from '../src/permit2/permit2.json'; // cause @uniswap/permi2 does not exist in npm
import { RouterParametersStruct } from "../typechain-types/universal-router/artifacts/contracts/UniversalRouter";

const weth9Addr = "0x81850632f76E7ceeB606773c3827e351D5A8438b";
const V2_INIT_CODE_HASH_MAINNET = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
const V3_INIT_CODE_HASH_MAINNET = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'

async function deployUniversalRouter(_taskArg: {}, hre: HardhatRuntimeEnvironment) {
  const permit2Factory = await hre.ethers.getContractFactoryFromArtifact(Permit2 as Artifact)
  const permit2Tx = await permit2Factory.deploy();
  await permit2Tx.waitForDeployment();
  console.log("Permit2 deployed to: ", permit2Tx.target);

  const zeroAddr = hre.ethers.ZeroAddress;
  const params: RouterParametersStruct = {
    permit2: permit2Tx.target,
    weth9: weth9Addr,
    seaportV1_5: zeroAddr,
    seaportV1_4: zeroAddr,
    openseaConduit: zeroAddr,
    nftxZap: zeroAddr,
    x2y2: zeroAddr,
    foundation: zeroAddr,
    sudoswap: zeroAddr,
    elementMarket: zeroAddr,
    nft20Zap: zeroAddr,
    cryptopunks: zeroAddr,
    looksRareV2: zeroAddr,
    routerRewardsDistributor: zeroAddr,
    looksRareRewardsDistributor: zeroAddr,
    looksRareToken: zeroAddr,
    v2Factory: zeroAddr,
    v3Factory: Biteigen.v3CoreFactoryAddress,
    pairInitCodeHash: V2_INIT_CODE_HASH_MAINNET,
    poolInitCodeHash: V3_INIT_CODE_HASH_MAINNET
  }
  const universalRouterFactory = await hre.ethers.getContractFactoryFromArtifact(UniversalRouter as Artifact)
  const universalRouterTx = await universalRouterFactory.deploy(params);
  await universalRouterTx.waitForDeployment();
  console.log("universal-router deployed to: ", universalRouterTx.target);
}

task("deployUniversalRouter", "deploy universal router")
  .setAction(deployUniversalRouter);

