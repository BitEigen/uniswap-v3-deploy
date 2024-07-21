import UniversalRouter from '@uniswap/universal-router/artifacts/contracts/UniversalRouter.sol/UniversalRouter.json'
import createDeployContractStep from './meta/createDeployContractStep'
import { RouterParametersStruct } from '../../typechain-types/universal-router/artifacts/contracts/UniversalRouter';

export const DEPLOY_V3_UNIVERSAL_ROUTER = createDeployContractStep({
  key: 'universalRouter',
  artifact: UniversalRouter,
  computeArguments(state, config) {
    if (state.permit2 === undefined || state.v3CoreFactoryAddress === undefined) {
      throw new Error('Missing permit2')
    }
    const V2_INIT_CODE_HASH_MAINNET = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f'
    const V3_INIT_CODE_HASH_MAINNET = '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'
    const fakeAddress: string = "0x0000000000000000000000000000000000000000";
    const params: RouterParametersStruct = {
      permit2: state.permit2,
      weth9: config.weth9Address,
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
      v3Factory: state.v3CoreFactoryAddress,
      pairInitCodeHash: V2_INIT_CODE_HASH_MAINNET,
      poolInitCodeHash: V3_INIT_CODE_HASH_MAINNET
    }
    return [params];
  },
})
