import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'PancakeSwap',
  description:
    'The most popular AMM on BSC by user count! Earn CAKE through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by PancakeSwap), NFTs, and more, on a platform you can trust.',
  image: 'https://PancakeSwap.finance/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  let basePath
  if (path.startsWith('/swap')) {
    basePath = '/swap'
  } else if (path.startsWith('/add')) {
    basePath = '/add'
  } else if (path.startsWith('/remove')) {
    basePath = '/remove'
  } else if (path.startsWith('/teams')) {
    basePath = '/teams'
  } else if (path.startsWith('/voting/proposal') && path !== '/voting/proposal/create') {
    basePath = '/voting/proposal'
  } else if (path.startsWith('/nfts/collections')) {
    basePath = '/nfts/collections'
  } else if (path.startsWith('/nfts/profile')) {
    basePath = '/nfts/profile'
  } else if (path.startsWith('/pancake-squad')) {
    basePath = '/pancake-squad'
  } else {
    basePath = path
  }

  switch (basePath) {
    case '/':
      return {
        title: `${t('Home')} | ${t('SincereDogeSwap')}`,
      }
    case '/swap':
      return {
        title: `${t('Exchange')} | ${t('SincereDogeSwap')}`,
      }
    case '/add':
      return {
        title: `${t('Add Liquidity')} | ${t('SincereDogeSwap')}`,
      }
    case '/remove':
      return {
        title: `${t('Remove Liquidity')} | ${t('SincereDogeSwap')}`,
      }
    case '/liquidity':
      return {
        title: `${t('Liquidity')} | ${t('SincereDogeSwap')}`,
      }
    case '/find':
      return {
        title: `${t('Import Pool')} | ${t('SincereDogeSwap')}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('SincereDogeSwap')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('SincereDogeSwap')}`,
      }
    case '/prediction/leaderboard':
      return {
        title: `${t('Leaderboard')} | ${t('SincereDogeSwap')}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('SincereDogeSwap')}`,
      }
    case '/farms/auction':
      return {
        title: `${t('Farm Auctions')} | ${t('SincereDogeSwap')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('SincereDogeSwap')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('SincereDogeSwap')}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('SincereDogeSwap')}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('SincereDogeSwap')}`,
      }
    case '/voting':
      return {
        title: `${t('Voting')} | ${t('SincereDogeSwap')}`,
      }
    case '/voting/proposal':
      return {
        title: `${t('Proposals')} | ${t('SincereDogeSwap')}`,
      }
    case '/voting/proposal/create':
      return {
        title: `${t('Make a Proposal')} | ${t('SincereDogeSwap')}`,
      }
    case '/info':
      return {
        title: `${t('Overview')} | ${t('SincereDogeSwap Info & Analytics')}`,
        description: 'View statistics for SincereDogeSwap exchanges.',
      }
    case '/info/pools':
      return {
        title: `${t('Pools')} | ${t('SincereDogeSwap Info & Analytics')}`,
        description: 'View statistics for SincereDogeSwap exchanges.',
      }
    case '/info/tokens':
      return {
        title: `${t('Tokens')} | ${t('PancakeSwap Info & Analytics')}`,
        description: 'View statistics for PancakeSwap exchanges.',
      }
    case '/nfts':
      return {
        title: `${t('Overview')} | ${t('PancakeSwap')}`,
      }
    case '/nfts/collections':
      return {
        title: `${t('Collections')} | ${t('PancakeSwap')}`,
      }
    case '/nfts/activity':
      return {
        title: `${t('Activity')} | ${t('PancakeSwap')}`,
      }
    case '/nfts/profile':
      return {
        title: `${t('Profile')} | ${t('PancakeSwap')}`,
      }
    case '/pancake-squad':
      return {
        title: `${t('Pancake Squad')} | ${t('PancakeSwap')}`,
      }
    default:
      return null
  }
}
