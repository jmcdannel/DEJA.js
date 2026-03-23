import AnimateIn from './AnimateIn'
import SectionLabel from './SectionLabel'
import { client } from '../../sanity/lib/client'
import { ACTIVE_PROMOTIONS_QUERY } from '../../sanity/lib/queries'
import { type SanityPromotion, isActiveNow } from '../../lib/promotions'

export default async function PromoHeroSection() {
  if (!client) return null

  const promos: SanityPromotion[] = await client.fetch(ACTIVE_PROMOTIONS_QUERY)
  const promo = promos.find(
    (p) => p.slots.includes('hero-section') && isActiveNow(p),
  )

  if (!promo) return null

  return (
    <section className="relative py-12 px-4 sm:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-deja-lime/5 via-transparent to-deja-cyan/5 pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative">
        <AnimateIn>
          <SectionLabel color="lime">
            {promo.icon ?? '🚀'} Launch Offer
          </SectionLabel>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-4">
            {promo.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-3">
            {promo.body}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {promo.ctas.map((cta) => (
              <a
                key={cta.url}
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  cta.style === 'primary'
                    ? 'inline-flex items-center gap-2 px-6 py-3 rounded-full bg-deja-lime text-black font-bold text-sm hover:opacity-90 transition-opacity glow-lime'
                    : cta.style === 'secondary'
                      ? 'inline-flex items-center gap-2 px-6 py-3 rounded-full border border-deja-lime text-deja-lime font-bold text-sm hover:bg-deja-lime/10 transition-colors'
                      : 'inline-flex items-center gap-2 px-6 py-3 text-deja-lime font-semibold text-sm hover:opacity-70 transition-opacity'
                }
              >
                {cta.label}
              </a>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
