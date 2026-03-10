import { implement } from '@orpc/server'

import { contract } from './contract'

export const rpc = implement(contract)
