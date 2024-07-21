import Permit2 from '../permit2/permit2.json' // cause @uniswap/permi2 does not exist in npm
import createDeployContractStep from './meta/createDeployContractStep'

export const DEPLOY_V3_PERMIT2 = createDeployContractStep({
  key: 'permit2',
  artifact: Permit2,
})
