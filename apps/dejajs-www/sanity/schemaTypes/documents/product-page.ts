import { defineType, defineField, defineArrayMember } from 'sanity'
import { RocketIcon } from '@sanity/icons'
import { seoFields } from '../shared/seo-fields'

export const productPage = defineType({
  name: 'productPage',
  title: 'Product Page',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Product Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short description shown under the product name',
    }),
    defineField({
      name: 'color',
      title: 'Theme Color',
      type: 'string',
      description: 'Tailwind color name (e.g., "cyan", "green", "purple")',
      options: {
        list: [
          { title: 'Cyan', value: 'cyan' },
          { title: 'Green', value: 'green' },
          { title: 'Purple', value: 'purple' },
          { title: 'Yellow', value: 'yellow' },
          { title: 'Red', value: 'red' },
          { title: 'Indigo', value: 'indigo' },
        ],
      },
    }),
    defineField({
      name: 'icon',
      title: 'Product Icon',
      type: 'image',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Longer description used on the product page',
    }),
    defineField({
      name: 'features',
      title: 'Core Capabilities',
      type: 'array',
      of: [defineArrayMember({ type: 'feature' })],
      description: 'Feature cards shown on the product page',
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'cta',
    }),
    ...seoFields,
  ],
  preview: {
    select: { title: 'title', subtitle: 'tagline', media: 'icon' },
  },
})
