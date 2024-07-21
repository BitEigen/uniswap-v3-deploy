import { expect } from 'chai'
import Permit2 from '../src/permit2/permit2.json' // cause @uniswap/permi2 does not exist in npm
import UniversalRouter from '@uniswap/universal-router/artifacts/contracts/UniversalRouter.sol/UniversalRouter.json'
import hre from 'hardhat'
import { Artifact } from 'hardhat/types';
import { RouterParametersStruct } from '../typechain-types/universal-router/artifacts/contracts/UniversalRouter';

describe('deploy permit2', () => {
  it('works for ETH', async () => {
    const V2_INIT_CODE_HASH_MAINNET = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
    const V3_INIT_CODE_HASH_MAINNET = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'
    const factory = await hre.ethers.getContractFactoryFromArtifact(Permit2 as Artifact)
    const tx = await factory.deploy();
    await tx.waitForDeployment();
    console.log("contract deployed to: ", tx.target);
    const fakeAddress = hre.ethers.ZeroAddress;
    const params: RouterParametersStruct = {
      permit2: tx.target,
      weth9: fakeAddress,
      seaportV1_5: fakeAddress,
      seaportV1_4: fakeAddress,
      openseaConduit: fakeAddress,
      nftxZap: fakeAddress,
      x2y2: fakeAddress,
      foundation: fakeAddress,
      sudoswap: fakeAddress,
      elementMarket: fakeAddress,
      nft20Zap: fakeAddress,
      cryptopunks: fakeAddress,
      looksRareV2: fakeAddress,
      routerRewardsDistributor: fakeAddress,
      looksRareRewardsDistributor: fakeAddress,
      looksRareToken: fakeAddress,
      v2Factory: fakeAddress,
      v3Factory: fakeAddress,
      pairInitCodeHash: V2_INIT_CODE_HASH_MAINNET,
      poolInitCodeHash: V3_INIT_CODE_HASH_MAINNET
    }
    const universalRouterFactory = await hre.ethers.getContractFactoryFromArtifact(UniversalRouter as Artifact)
    const tx2 = await universalRouterFactory.deploy(params);
    await tx2.waitForDeployment();
    console.log("contract deployed to: ", tx2.target);
  });

})

