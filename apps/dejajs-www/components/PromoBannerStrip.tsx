import { client } from '../sanity/lib/client'
import { ACTIVE_PROMOTIONS_QUERY } from '../sanity/lib/queries'

interface PromoCTA {
  label: string
  url: string
  style: 'primary' | 'secondary' | 'ghost'
}

interface SanityPromotion {
  _id: string
  slug: string
  title: string
  body: string
  icon: string | null
  variant: string
  ctas: PromoCTA[]
  slots: string[]
  startDate: string | null
  endDate: string | null
}

function isActiveNow(promo: SanityPromotion): boolean {
  const now = new Date()
  if (promo.startDate && new Date(promo.startDate) > now) return false
  if (promo.endDate && new Date(promo.endDate) < now) return false
  return true
}

export default async function PromoBannerStrip() {
  if (!client) return null

  const promos: SanityPromotion[] = await client.fetch(ACTIVE_PROMOTIONS_QUERY)
  const promo = promos.find(
    (p) => p.slots.includes('banner-top') && isActiveNow(p),
  )

  if (!promo) return null

  return (
    <div className="bg-gradient-to-r from-deja-lime/90 to-deja-cyan/90 text-black text-center py-2 px-4 text-sm font-medium">
      <span>
        {promo.icon && <span className="mr-1">{promo.icon}</span>}
        <strong>{promo.title}</strong> — {promo.body}
        {promo.ctas.map((cta) => (
          <a
            key={cta.url}
            href={cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold ml-2 hover:opacity-70 transition-opacity"
          >
            {cta.label}
          </a>
        ))}
      </span>
    </div>
  )
}
