import { defineType, defineField, defineArrayMember } from 'sanity'
import { BulkEditIcon } from '@sanity/icons'

export const promotion = defineType({
  name: 'promotion',
  title: 'Promotion',
  type: 'document',
  icon: BulkEditIcon,
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'Unique identifier (e.g., "launch-support")',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji or icon name (e.g., 🚀)',
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Success', value: 'success' },
          { title: 'Launch', value: 'launch' },
          { title: 'Warning', value: 'warning' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'ctas',
      title: 'Calls to Action',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'url', title: 'URL', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'style',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Primary', value: 'primary' },
                  { title: 'Secondary', value: 'secondary' },
                  { title: 'Ghost', value: 'ghost' },
                ],
                layout: 'radio',
              },
              initialValue: 'primary',
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        }),
      ],
    }),
    defineField({
      name: 'slots',
      title: 'Placement Slots',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Banner Top', value: 'banner-top' },
          { title: 'Hero Section', value: 'hero-section' },
        ],
      },
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'Leave empty for immediately active',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'Leave empty for no expiration',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug', active: 'active' },
    prepare({ title, subtitle, active }) {
      return {
        title: `${active ? '🟢' : '🔴'} ${title}`,
        subtitle,
      }
    },
  },
})
