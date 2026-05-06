import type { SapatamuEditorFontCatalogItem } from '@/types/sapatamu'
import type { WeddingThemePreset } from '@/types/wedding'

export const PUBLIC_ADDITIONAL_SOURCE_THEME_IDS = [
  "amaryllis-tapestry-red-garnet",
  "asih-prana-pixie",
  "chamomile-mica-beige",
  "gorga-nauli-tano",
  "mezalla-travertine-chalk",
  "panggih-prunella-midnight",
  "sindur-pinayung-imperial",
  "tresna-palakrama-tea-green"
] as const

export const PUBLIC_SOURCE_THEME_DEFAULT_MUSIC: Record<string, string> = {
  "premium1": "/sapatamu-themes/premium1/original/musics/music_1712289738674y409aqv.mp3",
  "sarune-batak-sangria": "/sapatamu-themes/sarune-batak-sangria/original/musics/music_1688982834916jisgv9.mp3",
  "amaryllis-tapestry-red-garnet": "/sapatamu-themes/amaryllis-tapestry-red-garnet/original/musics/music_1725365605552z6dbzjsi.mp3",
  "asih-prana-pixie": "/sapatamu-themes/asih-prana-pixie/original/musics/music_1749541826661fw9wslz.mp3",
  "chamomile-mica-beige": "/sapatamu-themes/chamomile-mica-beige/original/musics/music_1728885011510yqbolue.mp3",
  "gorga-nauli-tano": "/sapatamu-themes/gorga-nauli-tano/original/musics/music_1759580591927vidvxqa.mp3",
  "mezalla-travertine-chalk": "/sapatamu-themes/mezalla-travertine-chalk/original/musics/music_1707400625852ak1z7xy.mp3",
  "panggih-prunella-midnight": "/sapatamu-themes/panggih-prunella-midnight/original/musics/music_1686382733226zr3gavn.mp3",
  "sindur-pinayung-imperial": "/sapatamu-themes/sindur-pinayung-imperial/original/musics/music_17126553245316zz3fb4.mp3",
  "tresna-palakrama-tea-green": "/sapatamu-themes/tresna-palakrama-tea-green/original/musics/music_1724397443711rjlqq6q.mp3",
}

export const PUBLIC_SOURCE_THEME_FONTS: SapatamuEditorFontCatalogItem[] = [
  {
    "id": "font-amaryllis-open-sans",
    "name": "Open Sans",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
    "category": "display"
  },
  {
    "id": "font-amaryllis-poppins",
    "name": "Poppins",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
    "category": "sans"
  },
  {
    "id": "font-amaryllis-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-amaryllis-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-amaryllis-al-fresco",
    "name": "Al-Fresco",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-amaryllis-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-asih-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-asih-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-asih-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-asih-abhaya-libre",
    "name": "Abhaya Libre",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Abhaya+Libre&display=swap",
    "category": "serif"
  },
  {
    "id": "font-asih-aclonica",
    "name": "Aclonica",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Aclonica&display=swap",
    "category": "display"
  },
  {
    "id": "font-asih-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-chamomile-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-chamomile-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-chamomile-questa-grande",
    "name": "Questa-Grande",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-chamomile-gautreaux",
    "name": "Gautreaux",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-chamomile-abhaya-libre",
    "name": "Abhaya Libre",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Abhaya+Libre&display=swap",
    "category": "serif"
  },
  {
    "id": "font-chamomile-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-gorga-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-gorga-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-gorga-bickham-script-pro-3",
    "name": "Bickham-Script-Pro-3",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-gorga-annabelle-jf",
    "name": "Annabelle-JF",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-gorga-abhaya-libre",
    "name": "Abhaya Libre",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Abhaya+Libre&display=swap",
    "category": "serif"
  },
  {
    "id": "font-gorga-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-mezalla-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-mezalla-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-mezalla-annabelle-jf",
    "name": "Annabelle-JF",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-mezalla-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-mezalla-gautreaux",
    "name": "Gautreaux",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-mezalla-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-panggih-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-panggih-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-panggih-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-panggih-dulcinea",
    "name": "Dulcinea",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-panggih-aclonica",
    "name": "Aclonica",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Aclonica&display=swap",
    "category": "display"
  },
  {
    "id": "font-panggih-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-sindur-poppins",
    "name": "Poppins",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
    "category": "sans"
  },
  {
    "id": "font-sindur-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-sindur-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-sindur-annabelle-jf",
    "name": "Annabelle-JF",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-sindur-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-sindur-gautreaux",
    "name": "Gautreaux",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-sindur-abhaya-libre",
    "name": "Abhaya Libre",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Abhaya+Libre&display=swap",
    "category": "serif"
  },
  {
    "id": "font-sindur-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  },
  {
    "id": "font-tresna-poppins",
    "name": "Poppins",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
    "category": "sans"
  },
  {
    "id": "font-tresna-arima",
    "name": "Arima",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "serif"
  },
  {
    "id": "font-tresna-katibeh",
    "name": "Katibeh",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Alexandria&family=Amita:wght@400;700&family=Arima:wght@300;500&family=Katibeh&family=Ms+Madi&family=Poppins:wght@400;500&family=Sacramento&family=Sofia&display=swap",
    "category": "display"
  },
  {
    "id": "font-tresna-craw-modern-urw",
    "name": "Craw-Modern-URW",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-tresna-annabelle-jf",
    "name": "Annabelle-JF",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-tresna-tangier",
    "name": "Tangier",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-tresna-questa-grande",
    "name": "Questa-Grande",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "display"
  },
  {
    "id": "font-tresna-gautreaux",
    "name": "Gautreaux",
    "fontUrl": "https://use.typekit.net/czu0nkl.css",
    "category": "script"
  },
  {
    "id": "font-tresna-fahkwang",
    "name": "Fahkwang",
    "fontUrl": "https://fonts.googleapis.com/css2?family=Fahkwang&display=swap",
    "category": "sans"
  }
]

export const PUBLIC_SOURCE_THEME_PRESETS: WeddingThemePreset[] = [
  {
    "id": "amaryllis-tapestry-red-garnet",
    "name": "Amaryllis Tapestry - Red Garnet",
    "group": "Budaya",
    "description": "Tema Amaryllis Tapestry - Red Garnet yang direkonstruksi dari scrape asli.",
    "previewImage": "/sapatamu-themes/amaryllis-tapestry-red-garnet/original/pictures/picture_1739338788188xkqpvsi.jpeg",
    "primaryColor": "#f0b63b",
    "secondaryColor": "#e8d775",
    "accentColor": "#d7ff87",
    "fontHeading": "Tangier",
    "fontBody": "Poppins",
    "bgPattern": "batik"
  },
  {
    "id": "asih-prana-pixie",
    "name": "Asih Prana - Pixie",
    "group": "Budaya",
    "description": "Tema Asih Prana - Pixie yang direkonstruksi dari scrape asli.",
    "previewImage": "/sapatamu-themes/asih-prana-pixie/original/pictures/picture_17598873167628sxuxvc.jpeg",
    "primaryColor": "#646123",
    "secondaryColor": "#646123",
    "accentColor": "#c7c380",
    "fontHeading": "Tangier",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "chamomile-mica-beige",
    "name": "Chamomile Mica - Beige",
    "group": "Budaya",
    "description": "Tema Chamomile Mica - Beige yang direkonstruksi dari scrape asli.",
    "previewImage": "/sapatamu-themes/chamomile-mica-beige/original/pictures/picture_173937383935637doz57.jpeg",
    "primaryColor": "#994f5b",
    "secondaryColor": "#7e414b",
    "accentColor": "#bf848c",
    "fontHeading": "Gautreaux",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "gorga-nauli-tano",
    "name": "Gorga Nauli - Tano",
    "group": "Budaya",
    "description": "Tema Gorga Nauli - Tano yang direkonstruksi dari scrape asli.",
    "previewImage": "/sapatamu-themes/gorga-nauli-tano/original/pictures/picture_1771210484572u3md4sr.jpeg",
    "primaryColor": "#491103",
    "secondaryColor": "#491103",
    "accentColor": "#f1d9cd",
    "fontHeading": "Bickham-Script-Pro-3",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "mezalla-travertine-chalk",
    "name": "Mezalla Travertine - Chalk",
    "group": "Budaya",
    "description": "Tema Mezalla Travertine - Chalk yang direkonstruksi dari scrape asli.",
    "previewImage": "/sapatamu-themes/mezalla-travertine-chalk/original/pictures/picture_17393762970235qag6qp.jpeg",
    "primaryColor": "#634932",
    "secondaryColor": "#634932",
    "accentColor": "#cdb49c",
    "fontHeading": "Annabelle-JF",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "panggih-prunella-midnight",
    "name": "Panggih Prunella - Midnight",
    "group": "Budaya",
    "description": "Tema Panggih Prunella - Midnight yang direkonstruksi dari scrape asli.",
    "previewImage": "/sapatamu-themes/panggih-prunella-midnight/original/pictures/picture_1739341588542rfwkemh.jpeg",
    "primaryColor": "#ab8345",
    "secondaryColor": "#ab8345",
    "accentColor": "#ba9556",
    "fontHeading": "Tangier",
    "fontBody": "Arima",
    "bgPattern": "batik"
  },
  {
    "id": "sindur-pinayung-imperial",
    "name": "Sindur Pinayung - Imperial",
    "group": "Budaya",
    "description": "Tema Sindur Pinayung - Imperial yang direkonstruksi dari scrape asli.",
    "previewImage": "/sapatamu-themes/sindur-pinayung-imperial/original/pictures/picture_1739341758292juehtaq.jpeg",
    "primaryColor": "#a4424f",
    "secondaryColor": "#a4424f",
    "accentColor": "#d18d96",
    "fontHeading": "Annabelle-JF",
    "fontBody": "Poppins",
    "bgPattern": "batik"
  },
  {
    "id": "tresna-palakrama-tea-green",
    "name": "Tresna Palakrama - Tea Green",
    "group": "Budaya",
    "description": "Tema Tresna Palakrama - Tea Green yang direkonstruksi dari scrape asli.",
    "previewImage": "/sapatamu-themes/tresna-palakrama-tea-green/original/pictures/picture_1749014791063e9fk1kdf.jpeg",
    "primaryColor": "#ada849",
    "secondaryColor": "#485e46",
    "accentColor": "#a7cfb0",
    "fontHeading": "Annabelle-JF",
    "fontBody": "Poppins",
    "bgPattern": "batik"
  }
]
