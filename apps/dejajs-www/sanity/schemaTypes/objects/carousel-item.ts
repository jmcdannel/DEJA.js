import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const carouselItem = defineType({
  name: 'carouselItem',
  title: 'Carousel Item',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'alt', media: 'image' },
  },
})
