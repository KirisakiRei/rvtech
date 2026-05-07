import type { SapatamuEditorFontCatalogItem } from '@/types/sapatamu'
import type { WeddingThemePreset } from '@/types/wedding'

export const PUBLIC_ADDITIONAL_SOURCE_THEME_IDS = [
  "calla-lily-plum-red-lead",
  "kabagyan-linnea-swan-white",
  "honeysuckle-seashell",
  "hollyhock-nauli-sienna-ivory",
  "cheerfulness-floralwhite",
  "javanese-magnolia-tan-mahogany",
  "polyanthus-linnea-light-coral",
  "javanese-linnea-greenish-white",
  "aishwarya-peonny"
] as const

export const PUBLIC_SOURCE_THEME_DEFAULT_MUSIC: Record<string, string> = {
  "malay-ethnic-red-ruby": "/sapatamu-themes/malay-ethnic-red-ruby/original/musics/music_1712289738674y409aqv.mp3",
  "batak-ethnic-maroon-mistyrose": "/sapatamu-themes/batak-ethnic-maroon-mistyrose/original/musics/music_1688982834916jisgv9.mp3",
  "calla-lily-plum-red-lead": "/sapatamu-themes/calla-lily-plum-red-lead/original/musics/music_1725365605552z6dbzjsi.mp3",
  "kabagyan-linnea-swan-white": "/sapatamu-themes/kabagyan-linnea-swan-white/original/musics/music_1749541826661fw9wslz.mp3",
  "honeysuckle-seashell": "/sapatamu-themes/honeysuckle-seashell/original/musics/music_1728885011510yqbolue.mp3",
  "hollyhock-nauli-sienna-ivory": "/sapatamu-themes/hollyhock-nauli-sienna-ivory/original/musics/music_1759580591927vidvxqa.mp3",
  "cheerfulness-floralwhite": "/sapatamu-themes/cheerfulness-floralwhite/original/musics/music_1707400625852ak1z7xy.mp3",
  "javanese-magnolia-tan-mahogany": "/sapatamu-themes/javanese-magnolia-tan-mahogany/original/musics/music_1686382733226zr3gavn.mp3",
  "polyanthus-linnea-light-coral": "/sapatamu-themes/polyanthus-linnea-light-coral/original/musics/music_17126553245316zz3fb4.mp3",
  "javanese-linnea-greenish-white": "/sapatamu-themes/javanese-linnea-greenish-white/original/musics/music_1724397443711rjlqq6q.mp3",
  "aishwarya-peonny": "/sapatamu-themes/aishwarya-peonny/original/musics/SANDHAYU-SONG-Donkgedank-KASWOSIH-Backsound-Nusantara-Relaxing-Music.mp3",
}

export const PUBLIC_SOURCE_THEME_BACKDROPS: Record<string, string> = {
  "malay-ethnic-red-ruby": "/sapatamu-themes/malay-ethnic-red-ruby/backgrounds/global.webp",
  "cheerfulness-floralwhite": "/sapatamu-themes/cheerfulness-floralwhite/original/albums/album_1739376304266uhk38dc.jpeg",
  "batak-ethnic-maroon-mistyrose": "/sapatamu-themes/batak-ethnic-maroon-mistyrose/original/albums/album_1739377546935mw3035u.jpeg",
  "javanese-magnolia-tan-mahogany": "/sapatamu-themes/javanese-magnolia-tan-mahogany/original/albums/album_1739376941137biopu2q.jpeg",
  "kabagyan-linnea-swan-white": "/sapatamu-themes/kabagyan-linnea-swan-white/original/albums/album_17598077602542pxdlir.jpeg",
  "javanese-linnea-greenish-white": "/sapatamu-themes/javanese-linnea-greenish-white/original/albums/album_1749014798768jt6f7l2.jpeg",
  "polyanthus-linnea-light-coral": "/sapatamu-themes/polyanthus-linnea-light-coral/original/albums/album_1739377682445s6d565n.jpeg",
  "hollyhock-nauli-sienna-ivory": "/sapatamu-themes/hollyhock-nauli-sienna-ivory/original/albums/album_1771052344518pm3um1d.jpeg",
  "honeysuckle-seashell": "/sapatamu-themes/honeysuckle-seashell/original/albums/album_1739373844962xml672b.jpeg",
  "calla-lily-plum-red-lead": "/sapatamu-themes/calla-lily-plum-red-lead/original/albums/album_1739424658768tq692ws.jpeg",
  "aishwarya-peonny": "/sapatamu-themes/aishwarya-peonny/original/pictures/Heritage-Background-Home.webp",
}

export const PUBLIC_SOURCE_THEME_FONTS: SapatamuEditorFontCatalogItem[] = [
  {
    "id": "font-aishwarya-belgiano",
    "name": "Belgiano Serif",
    "fontUrl": "/sapatamu-themes/aishwarya-peonny/original/fonts/8543Belgiano-Serif.woff2",
    "category": "serif"
  },
  {
    "id": "font-aishwarya-neutica",
    "name": "Neutica",
    "fontUrl": "/sapatamu-themes/aishwarya-peonny/original/fonts/3858Neutica.woff2",
    "category": "display"
  },
  {
    "id": "font-aishwarya-pinyon",
    "name": "Pinyon Script",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap",
    "category": "script"
  },
  {
    "id": "font-aishwarya-lora",
    "name": "Lora",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&display=swap",
    "category": "serif"
  },
  {
    "id": "font-aishwarya-poppins",
    "name": "Poppins",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap",
    "category": "sans"
  },
  {
    "id": "font-calla-lily-plum-open-sans",
    "name": "Open Sans",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
    "category": "display"
  },
  {
    "id": "font-calla-lily-plum-poppins",
    "name": "Poppins",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
    "category": "sans"
  },
  {
    "id": "font-calla-lily-plum-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-calla-lily-plum-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-calla-lily-plum-al-fresco",
    "name": "Al-Fresco",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-calla-lily-plum-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-kabagyan-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-kabagyan-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-kabagyan-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-kabagyan-abhaya-libre",
    "name": "Abhaya Libre",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Abhaya+Libre&display=swap",
    "category": "serif"
  },
  {
    "id": "font-kabagyan-aclonica",
    "name": "Aclonica",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Aclonica&display=swap",
    "category": "display"
  },
  {
    "id": "font-kabagyan-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-honeysuckle-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-honeysuckle-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-honeysuckle-questa-grande",
    "name": "Questa-Grande",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-honeysuckle-gautreaux",
    "name": "Gautreaux",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-honeysuckle-abhaya-libre",
    "name": "Abhaya Libre",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Abhaya+Libre&display=swap",
    "category": "serif"
  },
  {
    "id": "font-honeysuckle-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-hollyhock-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-hollyhock-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-hollyhock-bickham-script-pro-3",
    "name": "Bickham-Script-Pro-3",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-hollyhock-annabelle-jf",
    "name": "Annabelle-JF",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-hollyhock-abhaya-libre",
    "name": "Abhaya Libre",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Abhaya+Libre&display=swap",
    "category": "serif"
  },
  {
    "id": "font-hollyhock-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-cheerfulness-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-cheerfulness-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-cheerfulness-annabelle-jf",
    "name": "Annabelle-JF",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-cheerfulness-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-cheerfulness-gautreaux",
    "name": "Gautreaux",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-cheerfulness-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-javanese-magnolia-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-javanese-magnolia-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-javanese-magnolia-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-javanese-magnolia-dulcinea",
    "name": "Dulcinea",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-javanese-magnolia-aclonica",
    "name": "Aclonica",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Aclonica&display=swap",
    "category": "display"
  },
  {
    "id": "font-javanese-magnolia-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-polyanthus-poppins",
    "name": "Poppins",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
    "category": "sans"
  },
  {
    "id": "font-polyanthus-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-polyanthus-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-polyanthus-annabelle-jf",
    "name": "Annabelle-JF",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-polyanthus-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-polyanthus-gautreaux",
    "name": "Gautreaux",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-polyanthus-abhaya-libre",
    "name": "Abhaya Libre",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Abhaya+Libre&display=swap",
    "category": "serif"
  },
  {
    "id": "font-polyanthus-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-javanese-linnea-poppins",
    "name": "Poppins",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
    "category": "sans"
  },
  {
    "id": "font-javanese-linnea-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-javanese-linnea-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-javanese-linnea-craw-modern-urw",
    "name": "Craw-Modern-URW",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-javanese-linnea-annabelle-jf",
    "name": "Annabelle-JF",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-javanese-linnea-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-javanese-linnea-questa-grande",
    "name": "Questa-Grande",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-javanese-linnea-gautreaux",
    "name": "Gautreaux",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-javanese-linnea-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  }
]

export const PUBLIC_SOURCE_THEME_PRESETS: WeddingThemePreset[] = [
  {
    "id": "cheerfulness-floralwhite",
    "name": "Cheerfulness - floralwhite",
    "group": "Budaya",
    "description": "Tema signature Cheerfulness bernuansa floralwhite.",
    "previewImage": "/sapatamu-themes/cheerfulness-floralwhite/original/pictures/picture_17393762970235qag6qp.jpeg",
    "primaryColor": "#634932",
    "secondaryColor": "#634932",
    "accentColor": "#cdb49c",
    "fontHeading": "Annabelle-JF",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "javanese-magnolia-tan-mahogany",
    "name": "Javanese magnolia - Tan mahogany",
    "group": "Budaya",
    "description": "Tema signature Javanese magnolia bernuansa tan mahogany.",
    "previewImage": "/sapatamu-themes/javanese-magnolia-tan-mahogany/original/pictures/picture_1739341588542rfwkemh.jpeg",
    "primaryColor": "#ab8345",
    "secondaryColor": "#ab8345",
    "accentColor": "#ba9556",
    "fontHeading": "Tangier",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "kabagyan-linnea-swan-white",
    "name": "Kabagyan Linnea - Swan white",
    "group": "Budaya",
    "description": "Tema signature Kabagyan Linnea bernuansa swan white.",
    "previewImage": "/sapatamu-themes/kabagyan-linnea-swan-white/original/pictures/picture_17598873167628sxuxvc.jpeg",
    "primaryColor": "#646123",
    "secondaryColor": "#646123",
    "accentColor": "#c7c380",
    "fontHeading": "Tangier",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "javanese-linnea-greenish-white",
    "name": "Javanese Linnea - Greenish white",
    "group": "Budaya",
    "description": "Tema signature Javanese Linnea bernuansa greenish white.",
    "previewImage": "/sapatamu-themes/javanese-linnea-greenish-white/original/pictures/picture_1749014791063e9fk1kdf.jpeg",
    "primaryColor": "#ada849",
    "secondaryColor": "#485e46",
    "accentColor": "#a7cfb0",
    "fontHeading": "Annabelle-JF",
    "fontBody": "Poppins",
    "bgPattern": "batik"
  },
  {
    "id": "polyanthus-linnea-light-coral",
    "name": "Polyanthus Linnea - Light coral",
    "group": "Budaya",
    "description": "Tema signature Polyanthus Linnea bernuansa light coral.",
    "previewImage": "/sapatamu-themes/polyanthus-linnea-light-coral/original/pictures/picture_1739341758292juehtaq.jpeg",
    "primaryColor": "#a4424f",
    "secondaryColor": "#a4424f",
    "accentColor": "#d18d96",
    "fontHeading": "Annabelle-JF",
    "fontBody": "Poppins",
    "bgPattern": "batik"
  },
  {
    "id": "hollyhock-nauli-sienna-ivory",
    "name": "Hollyhock Nauli - Sienna ivory",
    "group": "Budaya",
    "description": "Tema signature Hollyhock Nauli bernuansa sienna ivory.",
    "previewImage": "/sapatamu-themes/hollyhock-nauli-sienna-ivory/original/pictures/picture_1771210484572u3md4sr.jpeg",
    "primaryColor": "#491103",
    "secondaryColor": "#491103",
    "accentColor": "#f1d9cd",
    "fontHeading": "Bickham-Script-Pro-3",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "honeysuckle-seashell",
    "name": "Honeysuckle - seashell",
    "group": "Budaya",
    "description": "Tema signature Honeysuckle bernuansa seashell.",
    "previewImage": "/sapatamu-themes/honeysuckle-seashell/original/pictures/picture_173937383935637doz57.jpeg",
    "primaryColor": "#994f5b",
    "secondaryColor": "#7e414b",
    "accentColor": "#bf848c",
    "fontHeading": "Gautreaux",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "calla-lily-plum-red-lead",
    "name": "Calla Lily Plum - Red lead",
    "group": "Budaya",
    "description": "Tema signature Calla Lily Plum bernuansa red lead.",
    "previewImage": "/sapatamu-themes/calla-lily-plum-red-lead/original/pictures/picture_1739338788188xkqpvsi.jpeg",
    "primaryColor": "#852222",
    "secondaryColor": "#4f1212",
    "accentColor": "#876824",
    "fontHeading": "Tangier",
    "fontBody": "Poppins",
    "bgPattern": "batik"
  },
  {
    "id": "aishwarya-peonny",
    "name": "Aishwarya Peonny",
    "group": "Vintage",
    "description": "Tema vintage Aishwarya Peonny dari Heritage Series dengan layout floral klasik.",
    "previewImage": "/sapatamu-themes/aishwarya-peonny/original/pictures/Heritage-Background-Home.webp",
    "primaryColor": "#a54141",
    "secondaryColor": "#46402a",
    "accentColor": "#c4a15d",
    "fontHeading": "Pinyon Script",
    "fontBody": "Lora",
    "bgPattern": "floral"
  }
]
