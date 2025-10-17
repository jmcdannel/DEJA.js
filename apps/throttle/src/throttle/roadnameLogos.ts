import bnsfLogo from '@/assets/logos/bnsf.svg'
import amtrakLogo from '@/assets/logos/amtrak.svg'
import upLogo from '@/assets/logos/up.svg'
import cnLogo from '@/assets/logos/cn.svg'
import csxLogo from '@/assets/logos/csx.svg'
import nsLogo from '@/assets/logos/ns.svg'
import mrlLogo from '@/assets/logos/mrl.svg'
import gnLogo from '@/assets/logos/gn.svg'
import bnLogo from '@/assets/logos/bn.svg'
import santeFeLogo from '@/assets/logos/santefe.svg'

export interface RoadnameMedia {
  logo?: string
  fallbackClass: string
}

export const ROADNAME_MEDIA: Record<string, RoadnameMedia> = {
  bnsf: {
    logo: bnsfLogo,
    fallbackClass: 'bg-orange-500/90 text-white border border-orange-300/60',
  },
  amtrak: {
    logo: amtrakLogo,
    fallbackClass: 'bg-sky-500/80 text-slate-900 border border-sky-200/60',
  },
  up: {
    logo: upLogo,
    fallbackClass: 'bg-yellow-400/90 text-slate-800 border border-yellow-200/60',
  },
  cn: {
    logo: cnLogo,
    fallbackClass: 'bg-red-500/90 text-white border border-red-200/60',
  },
  csx: {
    logo: csxLogo,
    fallbackClass: 'bg-indigo-600/80 text-indigo-50 border border-indigo-300/60',
  },
  ns: {
    logo: nsLogo,
    fallbackClass: 'bg-zinc-800/80 text-zinc-100 border border-zinc-500/60',
  },
  mrl: {
    logo: mrlLogo,
    fallbackClass: 'bg-blue-600/80 text-blue-50 border border-blue-300/60',
  },
  gn: {
    logo: gnLogo,
    fallbackClass: 'bg-orange-600/80 text-orange-50 border border-orange-300/60',
  },
  bn: {
    logo: bnLogo,
    fallbackClass: 'bg-emerald-500/80 text-emerald-50 border border-emerald-200/60',
  },
  santefe: {
    logo: santeFeLogo,
    fallbackClass: 'bg-red-600/80 text-red-100 border border-red-300/60',
  },
}

export function getRoadnameMedia(value?: string | null) {
  if (!value) return undefined
  return ROADNAME_MEDIA[value.toLowerCase()]
}
