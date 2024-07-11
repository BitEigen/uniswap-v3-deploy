import { Contract } from 'ethers'

import UniswapV3Factory from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
import { expect } from 'chai'
import { Signer } from "ethers"
import hre from "hardhat"
import { DEPLOY_V3_CORE_FACTORY } from '../src/steps/deploy-v3-core-factory'
import { asciiStringToBytes32 } from '../src/util/asciiStringToBytes32'

const DUMMY_ADDRESS = '0x9999999999999999999999999999999999999999'
const { ethers } = hre;

describe('deploy-v3-core-factory', () => {
  let signer: Signer

  before('create provider', async () => {
    signer = (await ethers.getSigners())[0]
    console.log("before: ", await signer.getAddress());
  })

  function singleElem<T>(v: T[]): T {
    return v[0]
  }

  describe('DEPLOY_V3_CORE_FACTORY', () => {
    it('deploys the v3 core factory contract', async () => {
      const result = singleElem(
        await DEPLOY_V3_CORE_FACTORY(
          {},
          {
            signer,
            gasPrice: BigInt(1),
            ownerAddress: DUMMY_ADDRESS,
            v2CoreFactoryAddress: DUMMY_ADDRESS,
            weth9Address: DUMMY_ADDRESS,
            nativeCurrencyLabelBytes: asciiStringToBytes32('ETH'),
          }
        )
      )
      expect(result.message).to.eq('Contract UniswapV3Factory deployed')
    })

    it('does not deploy if already deployed', async () => {
      const result = singleElem(
        await DEPLOY_V3_CORE_FACTORY(
          { v3CoreFactoryAddress: DUMMY_ADDRESS },
          {
            signer,
            gasPrice: BigInt(1),
            ownerAddress: DUMMY_ADDRESS,
            v2CoreFactoryAddress: DUMMY_ADDRESS,
            weth9Address: DUMMY_ADDRESS,
            nativeCurrencyLabelBytes: asciiStringToBytes32('ETH'),
          }
        )
      )
      expect(result.message).to.eq('Contract UniswapV3Factory was already deployed')
      expect(result.address).to.eq(DUMMY_ADDRESS)
    })

    describe('test contract functions', () => {
      let v3CoreFactory: Contract
      beforeEach(async () => {
        const result = singleElem(
          await DEPLOY_V3_CORE_FACTORY(
            {},
            {
              signer,
              gasPrice: BigInt(1),
              ownerAddress: DUMMY_ADDRESS,
              v2CoreFactoryAddress: DUMMY_ADDRESS,
              weth9Address: DUMMY_ADDRESS,
              nativeCurrencyLabelBytes: asciiStringToBytes32('ETH'),
            }
          )
        )
        v3CoreFactory = await ethers.getContractAt(UniswapV3Factory.abi, result.address!)
      })

      it('points to signer address', async () => {
        expect(await v3CoreFactory.owner()).to.eq(await signer.getAddress())
      })
    })
  })
})
