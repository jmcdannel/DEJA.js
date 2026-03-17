import { defineField } from 'sanity'

export const seoFields = [
  defineField({
    name: 'seoTitle',
    title: 'SEO Title',
    type: 'string',
    description: 'Override the page title for search engines',
    validation: (rule) => rule.max(70).warning('Keep under 70 characters'),
  }),
  defineField({
    name: 'seoDescription',
    title: 'SEO Description',
    type: 'text',
    rows: 3,
    description: 'Override the meta description for search engines',
    validation: (rule) => rule.max(160).warning('Keep under 160 characters'),
  }),
  defineField({
    name: 'ogImage',
    title: 'Social Share Image',
    type: 'image',
    description: 'Image shown when shared on social media',
  }),
]
