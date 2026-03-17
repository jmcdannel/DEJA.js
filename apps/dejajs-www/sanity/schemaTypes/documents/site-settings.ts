import { defineType, defineField, defineArrayMember } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'productNavItems',
      title: 'Products Menu Items',
      type: 'array',
      of: [defineArrayMember({ type: 'navLink' })],
      description: 'Items shown in the Products mega-menu',
    }),
    defineField({
      name: 'docsNavItems',
      title: 'Docs Menu Items',
      type: 'array',
      of: [defineArrayMember({ type: 'navLink' })],
      description: 'Items shown in the Docs dropdown',
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer Links',
      type: 'array',
      of: [defineArrayMember({ type: 'navLink' })],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [defineArrayMember({ type: 'navLink' })],
    }),
    defineField({
      name: 'loginUrl',
      title: 'Login URL',
      type: 'url',
    }),
    defineField({
      name: 'signupUrl',
      title: 'Sign Up URL',
      type: 'url',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
