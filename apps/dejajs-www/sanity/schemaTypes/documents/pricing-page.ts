import { defineType, defineField, defineArrayMember } from 'sanity'
import { CreditCardIcon } from '@sanity/icons'
import { seoFields } from '../shared/seo-fields'

export const pricingPage = defineType({
  name: 'pricingPage',
  title: 'Pricing Page',
  type: 'document',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'tiers',
      title: 'Pricing Tiers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pricingTier',
          fields: [
            defineField({ name: 'name', title: 'Plan Name', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'monthlyPrice', title: 'Monthly Price', type: 'number' }),
            defineField({ name: 'yearlyPrice', title: 'Yearly Price', type: 'number' }),
            defineField({
              name: 'features',
              title: 'Included Features',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
            }),
            defineField({ name: 'cta', title: 'CTA', type: 'cta' }),
            defineField({ name: 'highlighted', title: 'Highlighted', type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'name' } },
        }),
      ],
    }),
    ...seoFields,
  ],
  preview: {
    prepare: () => ({ title: 'Pricing' }),
  },
})
