import { defineType, defineField } from 'sanity'
import { BulbOutlineIcon } from '@sanity/icons'

export const feature = defineType({
  name: 'feature',
  title: 'Feature',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Icon identifier (e.g., "usb", "wifi", "gauge")',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
})
