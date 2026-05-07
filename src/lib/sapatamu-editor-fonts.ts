import type { SapatamuEditorFontCatalogItem } from '@/types/sapatamu'
import { PUBLIC_SOURCE_THEME_FONTS } from './sapatamu-source-themes'

export const PUBLIC_SAPATAMU_EDITOR_FONTS: SapatamuEditorFontCatalogItem[] = [
  {
    id: 'font-poppins',
    name: 'Poppins',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    id: 'font-cormorant',
    name: 'Cormorant Garamond',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap',
    category: 'serif',
  },
  {
    id: 'font-playfair-display',
    name: 'Playfair Display',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    category: 'display',
  },
  {
    id: 'font-great-vibes',
    name: 'Great Vibes',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
    category: 'script',
  },
  {
    id: 'font-sacramento',
    name: 'Sacramento',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Sacramento&display=swap',
    category: 'script',
  },
  {
    id: 'font-dm-serif-display',
    name: 'DM Serif Display',
    fontUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap',
    category: 'display',
  },
  {
    id: 'font-cinzel',
    name: 'Cinzel',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap',
    category: 'display',
  },
  {
    id: 'font-questa-grande',
    name: 'Questa-Grande',
    fontUrl: 'https://use.typekit.net/czu0nkl.css',
    category: 'display',
  },
  {
    id: 'font-malay-fahkwang',
    name: 'Fahkwang',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Fahkwang:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    id: 'font-malay-gautreaux',
    name: 'Gautreaux',
    fontUrl: 'https://use.typekit.net/czu0nkl.css',
    category: 'script',
  },
  {
    id: 'font-malay-katibeh',
    name: 'Katibeh',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Katibeh&display=swap',
    category: 'display',
  },
  {
    id: 'font-malay-arima',
    name: 'Arima',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Arima:wght@300;400;500;600;700&display=swap',
    category: 'serif',
  },
  {
    id: 'font-malay-tangier',
    name: 'Tangier',
    fontUrl: 'https://use.typekit.net/czu0nkl.css',
    category: 'script',
  },
  {
    id: 'font-batak-fahkwang',
    name: 'Fahkwang',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Fahkwang:wght@400;500;600;700&display=swap',
    category: 'sans',
  },
  {
    id: 'font-batak-gautreaux',
    name: 'Gautreaux',
    fontUrl: 'https://use.typekit.net/czu0nkl.css',
    category: 'script',
  },
  {
    id: 'font-batak-annabelle',
    name: 'Annabelle-JF',
    fontUrl: 'https://use.typekit.net/czu0nkl.css',
    category: 'script',
  },
  {
    id: 'font-batak-katibeh',
    name: 'Katibeh',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Katibeh&display=swap',
    category: 'display',
  },
  {
    id: 'font-batak-arima',
    name: 'Arima',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Arima:wght@300;400;500;600;700&display=swap',
    category: 'serif',
  },
  ...PUBLIC_SOURCE_THEME_FONTS,
]
