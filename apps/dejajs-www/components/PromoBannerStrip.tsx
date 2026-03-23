import { client } from '../sanity/lib/client'
import { ACTIVE_PROMOTIONS_QUERY } from '../sanity/lib/queries'
import { type SanityPromotion, isActiveNow } from '../lib/promotions'

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
