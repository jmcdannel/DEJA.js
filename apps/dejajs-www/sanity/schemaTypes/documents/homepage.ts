import { defineType, defineField, defineArrayMember } from 'sanity'
import { HomeIcon } from '@sanity/icons'
import { seoFields } from '../shared/seo-fields'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 3 }),
        defineField({ name: 'cta', title: 'Call to Action', type: 'cta' }),
      ],
    }),
    defineField({
      name: 'productShowcase',
      title: 'Product Showcase',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'productPage' }] })],
      description: 'Products displayed in the showcase grid',
    }),
    defineField({
      name: 'desktopCarousel',
      title: 'Desktop Screenshots',
      type: 'array',
      of: [defineArrayMember({ type: 'carouselItem' })],
    }),
    defineField({
      name: 'mobileCarousel',
      title: 'Mobile Screenshots',
      type: 'array',
      of: [defineArrayMember({ type: 'carouselItem' })],
    }),
    defineField({
      name: 'quickStartSection',
      title: 'Quick Start Section',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        defineField({ name: 'videoUrl', title: 'Video URL', type: 'url' }),
      ],
    }),
    defineField({
      name: 'architectureImage',
      title: 'Architecture Diagram',
      type: 'image',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA (bottom)',
      type: 'cta',
    }),
    ...seoFields,
  ],
  preview: {
    prepare: () => ({ title: 'Homepage' }),
  },
})
