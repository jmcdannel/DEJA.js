import { defineType, defineField, defineArrayMember } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons'
import { seoFields } from '../shared/seo-fields'

export const faqPage = defineType({
  name: 'faqPage',
  title: 'FAQ Page',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'FAQ Sections',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqSection',
          title: 'FAQ Section',
          fields: [
            defineField({ name: 'heading', title: 'Section Heading', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'entries',
              title: 'Questions & Answers',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'faqEntry',
                  fields: [
                    defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
                    defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (rule) => rule.required() }),
                  ],
                  preview: { select: { title: 'question' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'heading' } },
        }),
      ],
    }),
    ...seoFields,
  ],
  preview: {
    prepare: () => ({ title: 'FAQ' }),
  },
})
