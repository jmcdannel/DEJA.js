import type { StructureResolver } from 'sanity/structure'
import { CogIcon, HomeIcon, CreditCardIcon, RocketIcon } from '@sanity/icons'

const SINGLETONS = ['homepage', 'pricingPage', 'siteSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('DEJA.js Content')
    .items([
      S.listItem()
        .title('Homepage')
        .icon(HomeIcon)
        .child(S.document().schemaType('homepage').documentId('homepage').title('Homepage')),

      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site Settings')),

      S.divider(),

      S.listItem()
        .title('Product Pages')
        .icon(RocketIcon)
        .child(S.documentTypeList('productPage').title('Product Pages')),

      S.divider(),

      S.listItem()
        .title('Pricing')
        .icon(CreditCardIcon)
        .child(S.document().schemaType('pricingPage').documentId('pricingPage').title('Pricing')),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !SINGLETONS.includes(listItem.getId() as string) && listItem.getId() !== 'productPage'
      ),
    ])
