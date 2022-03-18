import {
  MenuItemsType,
  // DropdownMenuItemType,
  SwapIcon,
  SwapFillIcon,
  EarnFillIcon,
  EarnIcon,
  TrophyIcon,
  TrophyFillIcon,
  NftIcon,
  NftFillIcon,
  MoreIcon,
  // menuStatus,
} from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'
// import { nftsBaseUrl } from 'views/Nft/market/constants'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t']) => ConfigMenuItemsType[] = (t) => [
  {
    label: t('Trade'),
    icon: SwapIcon,
    fillIcon: SwapFillIcon,
    href: '/swap',
    showItemsOnMobile: false,
    isSoonStatu: false,
    items: [
      {
        label: t('Exchange'),
        href: '/swap',
        isSoonStatu: false,
      },
      {
        label: t('Liquidity'),
        href: '/liquidity',
        isSoonStatu: false,
      },
    ],
  },
  {
    label: t('Farm'),
    href: '/swap',
    isSoonStatu: true,
    icon: EarnIcon,
    fillIcon: EarnFillIcon,
    showItemsOnMobile: false,
    // items: [
    //   {
    //     label: t('Farms'),
    //     href: '/farms',
    //   },
    //   {
    //     label: t('Pools'),
    //     href: '/pools',
    //   },
    // ],
  },
  {
    label: t('Lottery'),
    href: '/swap',
    icon: TrophyIcon,
    isSoonStatu: true,
    fillIcon: TrophyFillIcon,
    showItemsOnMobile: false,
    // items: [
    //   {
    //     label: t('Trading Competition'),
    //     href: '/competition',
    //   },
    //   {
    //     label: t('Prediction (BETA)'),
    //     href: '/prediction',
    //   },
    //   {
    //     label: t('Lottery'),
    //     href: '/lottery',
    //   },
    // ],
  },
  {
    label: t('NFT'),
    // href: `${nftsBaseUrl}`,
    showItemsOnMobile: false,
    href: '/swap',
    isSoonStatu: true,
    icon: NftIcon,
    fillIcon: NftFillIcon,
    // items: [
    //   {
    //     label: t('Overview'),
    //     href: `${nftsBaseUrl}`,
    //   },
    //   {
    //     label: t('Collections'),
    //     href: `${nftsBaseUrl}/collections`,
    //   },
    //   {
    //     label: t('Activity'),
    //     href: `${nftsBaseUrl}/activity`,
    //   },
    // ],
  },
  {
    label: '',
    href: '/swap',
    icon: MoreIcon,
    hideSubNav: true,
    items: [
      {
        label: t('Game'),
        href: '/swap',
        isSoonStatu: true,
      },
      {
        label: 'Launchpad',
        href: '/swap',
        isSoonStatu: true,
      }
      // {
      //   label: t('IFO'),
      //   href: '/ifo',
      //   status: menuStatus.SOON,
      // },
      // {
      //   label: t('Voting'),
      //   href: '/voting',
      // },
      // {
      //   type: DropdownMenuItemType.DIVIDER,
      // },
      // {
      //   label: t('Leaderboard'),
      //   href: '/teams',
      // },
      // {
      //   type: DropdownMenuItemType.DIVIDER,
      // },
      // {
      //   label: t('Blog'),
      //   href: 'https://medium.com/pancakeswap',
      //   type: DropdownMenuItemType.EXTERNAL_LINK,
      // },
      // {
      //   label: t('Docs'),
      //   href: 'https://docs.pancakeswap.finance',
      //   type: DropdownMenuItemType.EXTERNAL_LINK,
      // },
    ],
  },
]

export default config
