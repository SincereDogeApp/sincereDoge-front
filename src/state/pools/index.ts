import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import poolsConfig from 'config/constants/pools'
import {
  AppThunk,
  PoolsState,
  SerializedPool,
  SerializedVaultFees,
  SerializedIfoVaultUser,
  SerializedIfoCakeVault,
  SerializedVaultUser,
  SerializedCakeVault,
} from 'state/types'
import cakeAbi from 'config/abi/cake.json'
import tokens from 'config/constants/tokens'
import masterChef from 'config/abi/masterchef.json'
import { getAddress, getMasterChefAddress } from 'utils/addressHelpers'
import { getPoolApr } from 'utils/apr'
import { BIG_ZERO } from 'utils/bigNumber'
import { getCakeContract } from 'utils/contractHelpers'
import { getBalanceNumber } from 'utils/formatBalance'
import { simpleRpcProvider } from 'utils/providers'
import { multicallv2 } from 'utils/multicall'
import { fetchIfoPoolFeesData, fetchPublicIfoPoolData } from './fetchIfoPoolPublic'
import fetchIfoPoolUserData from './fetchIfoPoolUser'
import {
  fetchPoolsBlockLimits,
  fetchPoolsProfileRequirement,
  fetchPoolsStakingLimits,
  fetchPoolsTotalStaking,
} from './fetchPools'
import {
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserPendingRewards,
  fetchUserStakeBalances,
} from './fetchPoolsUser'
import { fetchPublicVaultData, fetchVaultFees } from './fetchVaultPublic'
import fetchVaultUser from './fetchVaultUser'
import { getTokenPricesFromFarm } from './helpers'
import { resetUserState } from '../global/actions'

export const initialPoolVaultState = Object.freeze({
  totalShares: null,
  pricePerFullShare: null,
  totalCakeInVault: null,
  estimatedCakeBountyReward: null,
  totalPendingCakeHarvest: null,
  fees: {
    performanceFee: null,
    callFee: null,
    withdrawalFee: null,
    withdrawalFeePeriod: null,
  },
  userData: {
    isLoading: true,
    userShares: null,
    cakeAtLastUserAction: null,
    lastDepositedTime: null,
    lastUserActionTime: null,
    credit: null,
  },
  creditStartBlock: null,
})

const initialState: PoolsState = {
  data: [...poolsConfig],
  userDataLoaded: false,
  cakeVault: initialPoolVaultState,
  ifoPool: initialPoolVaultState,
}

// Thunks
const cakePool = poolsConfig.find((pool) => pool.sousId === 0)
const cakePoolAddress = getAddress(cakePool.contractAddress)
const cakeContract = getCakeContract()
export const fetchCakePoolPublicDataAsync = () => async (dispatch, getState) => {
  const prices = getTokenPricesFromFarm(getState().farms.data)
  const stakingTokenAddress = cakePool.stakingToken.address ? cakePool.stakingToken.address.toLowerCase() : null
  const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0
  const earningTokenAddress = cakePool.earningToken.address ? cakePool.earningToken.address.toLowerCase() : null
  const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
  const totalStaking = await cakeContract.balanceOf(cakePoolAddress)
  const apr = getPoolApr(
    stakingTokenPrice,
    earningTokenPrice,
    getBalanceNumber(new BigNumber(totalStaking ? totalStaking.toString() : 0), cakePool.stakingToken.decimals),
    parseFloat(cakePool.tokenPerBlock),
  )

  dispatch(
    setPoolPublicData({
      sousId: 0,
      data: {
        totalStaked: new BigNumber(totalStaking.toString()).toJSON(),
        stakingTokenPrice,
        earningTokenPrice,
        apr,
      },
    }),
  )
}

export const fetchCakePoolUserDataAsync = (account: string) => async (dispatch) => {
  const allowanceCall = {
    address: tokens.cake.address,
    name: 'allowance',
    params: [account, cakePoolAddress],
  }
  const balanceOfCall = {
    address: tokens.cake.address,
    name: 'balanceOf',
    params: [account],
  }
  const cakeContractCalls = [allowanceCall, balanceOfCall]
  const [[allowance], [stakingTokenBalance]] = await multicallv2(cakeAbi, cakeContractCalls)

  const masterChefCalls = ['pendingCake', 'userInfo'].map((method) => ({
    address: getMasterChefAddress(),
    name: method,
    params: ['0', account],
  }))
  const [[pendingReward], { amount: masterPoolAmount }] = await multicallv2(masterChef, masterChefCalls)

  dispatch(
    setPoolUserData({
      sousId: 0,
      data: {
        allowance: new BigNumber(allowance.toString()).toJSON(),
        stakingTokenBalance: new BigNumber(stakingTokenBalance.toString()).toJSON(),
        pendingReward: new BigNumber(pendingReward.toString()).toJSON(),
        stakedBalances: new BigNumber(masterPoolAmount.toString()).toJSON(),
      },
    }),
  )
}

export const fetchPoolsPublicDataAsync = (currentBlockNumber: number) => async (dispatch, getState) => {
  try {
    const blockLimits = await fetchPoolsBlockLimits()
    const totalStakings = await fetchPoolsTotalStaking()
    const profileRequirements = await fetchPoolsProfileRequirement()
    let currentBlock = currentBlockNumber
    if (!currentBlock) {
      currentBlock = await simpleRpcProvider.getBlockNumber()
    }

    const prices = getTokenPricesFromFarm(getState().farms.data)

    const liveData = poolsConfig.map((pool) => {
      const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
      const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
      const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
      const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded

      const stakingTokenAddress = pool.stakingToken.address ? pool.stakingToken.address.toLowerCase() : null
      const stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0

      const earningTokenAddress = pool.earningToken.address ? pool.earningToken.address.toLowerCase() : null
      const earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
      const apr = !isPoolFinished
        ? getPoolApr(
            stakingTokenPrice,
            earningTokenPrice,
            getBalanceNumber(new BigNumber(totalStaking.totalStaked), pool.stakingToken.decimals),
            parseFloat(pool.tokenPerBlock),
          )
        : 0

      const profileRequirement = profileRequirements[pool.sousId] ? profileRequirements[pool.sousId] : undefined

      return {
        ...blockLimit,
        ...totalStaking,
        profileRequirement,
        stakingTokenPrice,
        earningTokenPrice,
        apr,
        isFinished: isPoolFinished,
      }
    })

    dispatch(setPoolsPublicData(liveData))
  } catch (error) {
    console.error('[Pools Action] error when getting public data', error)
  }
}

export const fetchPoolsStakingLimitsAsync = () => async (dispatch, getState) => {
  const poolsWithStakingLimit = getState()
    .pools.data.filter(({ stakingLimit }) => stakingLimit !== null && stakingLimit !== undefined)
    .map((pool) => pool.sousId)

  try {
    const stakingLimits = await fetchPoolsStakingLimits(poolsWithStakingLimit)

    const stakingLimitData = poolsConfig.map((pool) => {
      if (poolsWithStakingLimit.includes(pool.sousId)) {
        return { sousId: pool.sousId }
      }
      const { stakingLimit, numberBlocksForUserLimit } = stakingLimits[pool.sousId] || {
        stakingLimit: BIG_ZERO,
        numberBlocksForUserLimit: 0,
      }
      return {
        sousId: pool.sousId,
        stakingLimit: stakingLimit.toJSON(),
        numberBlocksForUserLimit,
      }
    })

    dispatch(setPoolsPublicData(stakingLimitData))
  } catch (error) {
    console.error('[Pools Action] error when getting staking limits', error)
  }
}

export const fetchPoolsUserDataAsync =
  (account: string): AppThunk =>
  async (dispatch) => {
    try {
      const allowances = await fetchPoolsAllowance(account)
      const stakingTokenBalances = await fetchUserBalances(account)
      const stakedBalances = await fetchUserStakeBalances(account)
      const pendingRewards = await fetchUserPendingRewards(account)

      const userData = poolsConfig.map((pool) => ({
        sousId: pool.sousId,
        allowance: allowances[pool.sousId],
        stakingTokenBalance: stakingTokenBalances[pool.sousId],
        stakedBalance: stakedBalances[pool.sousId],
        pendingReward: pendingRewards[pool.sousId],
      }))

      dispatch(setPoolsUserData(userData))
    } catch (error) {
      console.error('[Pools Action] Error fetching pool user data', error)
    }
  }

export const updateUserAllowance =
  (sousId: number, account: string): AppThunk =>
  async (dispatch) => {
    const allowances = await fetchPoolsAllowance(account)
    dispatch(updatePoolsUserData({ sousId, field: 'allowance', value: allowances[sousId] }))
  }

export const updateUserBalance =
  (sousId: number, account: string): AppThunk =>
  async (dispatch) => {
    const tokenBalances = await fetchUserBalances(account)
    dispatch(updatePoolsUserData({ sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }))
  }

export const updateUserStakedBalance =
  (sousId: number, account: string): AppThunk =>
  async (dispatch) => {
    const stakedBalances = await fetchUserStakeBalances(account)
    dispatch(updatePoolsUserData({ sousId, field: 'stakedBalance', value: stakedBalances[sousId] }))
  }

export const updateUserPendingReward =
  (sousId: number, account: string): AppThunk =>
  async (dispatch) => {
    const pendingRewards = await fetchUserPendingRewards(account)
    dispatch(updatePoolsUserData({ sousId, field: 'pendingReward', value: pendingRewards[sousId] }))
  }

export const fetchCakeVaultPublicData = createAsyncThunk<SerializedCakeVault>('cakeVault/fetchPublicData', async () => {
  const publicVaultInfo = await fetchPublicVaultData()
  return publicVaultInfo
})

export const fetchCakeVaultFees = createAsyncThunk<SerializedVaultFees>('cakeVault/fetchFees', async () => {
  const vaultFees = await fetchVaultFees()
  return vaultFees
})

export const fetchCakeVaultUserData = createAsyncThunk<SerializedVaultUser, { account: string }>(
  'cakeVault/fetchUser',
  async ({ account }) => {
    const userData = await fetchVaultUser(account)
    return userData
  },
)

export const fetchIfoPoolPublicData = createAsyncThunk<SerializedIfoCakeVault>('ifoPool/fetchPublicData', async () => {
  const publicVaultInfo = await fetchPublicIfoPoolData()
  return publicVaultInfo
})

export const fetchIfoPoolFees = createAsyncThunk<SerializedVaultFees>('ifoPool/fetchFees', async () => {
  const vaultFees = await fetchIfoPoolFeesData()
  return vaultFees
})

export const fetchIfoPoolUserAndCredit = createAsyncThunk<SerializedIfoVaultUser, { account: string }>(
  'ifoPool/fetchUser',
  async ({ account }) => {
    const userData = await fetchIfoPoolUserData(account)
    return userData
  },
)

export const PoolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    setPoolPublicData: (state, action) => {
      const { sousId } = action.payload
      const poolIndex = state.data.findIndex((pool) => pool.sousId === sousId)
      state.data[poolIndex] = {
        ...state.data[poolIndex],
        ...action.payload.data,
      }
    },
    setPoolUserData: (state, action) => {
      const { sousId } = action.payload
      const poolIndex = state.data.findIndex((pool) => pool.sousId === sousId)
      state.data[poolIndex].userData = action.payload.data
    },
    setPoolsPublicData: (state, action) => {
      const livePoolsData: SerializedPool[] = action.payload
      state.data = state.data.map((pool) => {
        const livePoolData = livePoolsData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, ...livePoolData }
      })
    },
    setPoolsUserData: (state, action) => {
      const userData = action.payload
      state.data = state.data.map((pool) => {
        const userPoolData = userData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, userData: userPoolData }
      })
      state.userDataLoaded = true
    },
    updatePoolsUserData: (state, action) => {
      const { field, value, sousId } = action.payload
      const index = state.data.findIndex((p) => p.sousId === sousId)

      if (index >= 0) {
        state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetUserState, (state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state.data = state.data.map(({ userData, ...pool }) => {
        return { ...pool }
      })
      state.userDataLoaded = false
      state.cakeVault = { ...state.cakeVault, userData: initialPoolVaultState.userData }
      state.ifoPool = { ...state.ifoPool, userData: initialPoolVaultState.userData }
    })
    // Vault public data that updates frequently
    builder.addCase(fetchCakeVaultPublicData.fulfilled, (state, action: PayloadAction<SerializedCakeVault>) => {
      state.cakeVault = { ...state.cakeVault, ...action.payload }
    })
    // Vault fees
    builder.addCase(fetchCakeVaultFees.fulfilled, (state, action: PayloadAction<SerializedVaultFees>) => {
      const fees = action.payload
      state.cakeVault = { ...state.cakeVault, fees }
    })
    // Vault user data
    builder.addCase(fetchCakeVaultUserData.fulfilled, (state, action: PayloadAction<SerializedVaultUser>) => {
      const userData = action.payload
      userData.isLoading = false
      state.cakeVault = { ...state.cakeVault, userData }
    })
    // Vault public data that updates frequently
    builder.addCase(fetchIfoPoolPublicData.fulfilled, (state, action) => {
      state.ifoPool = { ...state.ifoPool, ...action.payload }
    })
    // Vault fees
    builder.addCase(fetchIfoPoolFees.fulfilled, (state, action: PayloadAction<SerializedVaultFees>) => {
      const fees = action.payload
      state.ifoPool = { ...state.ifoPool, fees }
    })
    // Vault user data
    builder.addCase(fetchIfoPoolUserAndCredit.fulfilled, (state, action) => {
      const userData = action.payload
      userData.isLoading = false
      state.ifoPool = { ...state.ifoPool, userData }
    })
  },
})

// Actions
export const { setPoolsPublicData, setPoolsUserData, updatePoolsUserData, setPoolPublicData, setPoolUserData } =
  PoolsSlice.actions

export default PoolsSlice.reducer
