import { SunnyTemplate } from '@/components/templates/sunny/SunnyTemplate';
import type { SunnyTemplateData } from '@/components/templates/sunny/SunnyTemplate';

const dummyData: SunnyTemplateData = {
  assets: {
    bg: 'https://wp.envelope.id/wp-content/uploads/2026/01/sunny_bg2_ext.webp',
    flower3: 'https://wp.envelope.id/wp-content/uploads/2026/01/sunny_bg1_ext.webp',
    couple: 'https://wp.envelope.id/wp-content/uploads/2026/01/inv_787_BSoyubpg.png',
    flower2: 'https://wp.envelope.id/wp-content/uploads/2026/01/sunny_fg2_ext.webp',
    flower1: 'https://wp.envelope.id/wp-content/uploads/2026/01/sunny_fg1_ext.webp',
    coverImage: 'https://wp.envelope.id/wp-content/uploads/2026/01/inv_787_2m3MbsMV.jpg',
    cloud3: 'https://wp.envelope.id/wp-content/uploads/2025/06/cloud3_80_min.png',
    cloud4: 'https://wp.envelope.id/wp-content/uploads/2026/01/cloud4_90.webp',
    flowerDecor: 'https://wp.envelope.id/wp-content/uploads/2026/01/sunny_fg2_ext.webp',
    flowerDecor2: 'https://wp.envelope.id/wp-content/uploads/2026/01/sunny_decor1.webp',
  },
  cover: { 
    title: "Vincent & Natasha", 
    subtitle: "The Wedding of", 
    date: "Saturday, April 25, 2026" 
  },
  verse: {
    text: "So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate.",
    source: "Matthew 19:6"
  },
  bride: { 
    nickname: "Natasha", 
    fullName: "Natasha Aurelia", 
    parents: "Mr. Natasha's Father &\nMrs. Natasha's Mother", 
    instagram: "natasha", 
    instagramLink: "https://instagram.com/natasha" 
  },
  groom: { 
    nickname: "Vincent", 
    fullName: "Vincent Raphael", 
    parents: "Mr. Vincent's Father &\nMrs. Vincent's Mother", 
    instagram: "vincent", 
    instagramLink: "https://instagram.com/vincent" 
  },
  events: {
    matrimony: {
      title: "Holy Matrimony",
      date: "Saturday, April 25, 2026",
      time: "13.00 - 14.00 WIB",
      locationName: "Plaza Rafaela Garden",
      locationAddress: "Jl. Suryalaya Indah, Buah Batu, Bandung",
      mapLink: "#"
    },
    reception: {
      title: "Reception",
      date: "Saturday, April 25, 2026",
      time: "14.00 - 17.00 WIB",
      locationName: "Plaza Rafaela Garden",
      locationAddress: "Jl. Suryalaya Indah, Buah Batu, Bandung",
      mapLink: "#"
    }
  },
  dresscode: {
    title: "Dresscode",
    description: "We would love for our guests to wear these colors on our special day.",
    colors: ['#ad9078', '#fff']
  },
  quote: {
    text: "\u201CYou know you\u2019re in love when you can\u2019t fall asleep because reality is finally better than your dreams.\u201D \u2014 Dr. Seuss"
  },
  rsvp: {
    title: "Rsvp Wishes",
    subtitle: "Tell us you\u2019re coming and leave a few words\u2014we\u2019d love to hear from you!",
    countdown: { days: 26, hours: 18, minutes: 31, seconds: 3 },
    comments: [
      { name: "Gea jakarta", text: "Happy wedding \u2728", time: "7 days 5 hours ago" },
      { name: "Lauren", text: "Congrats!", time: "67 days 17 hours ago" },
      { name: "Chelsea", text: "Happy wedding \u2764\uFE0F", time: "157 days 20 hours ago" }
    ]
  },
  story: {
    title: "Our Love Story",
    bgImage: "https://wp.envelope.id/wp-content/uploads/2026/01/inv_787_CMNWfW3O.jpg",
    timeline: [
      {
        title: "The Beginning",
        description: "Our story began like a quiet song\u2014unexpected yet comforting. We met at just the right time, when life was still figuring itself out. What started as casual conversations turned into deep connections, shared dreams, and a sense of home in each other\u2019s presence."
      },
      {
        title: "Growing Love",
        description: "As time passed, we grew not just as individuals, but as a team. We\u2019ve celebrated wins, braved challenges, and found countless reasons to laugh along the way."
      },
      {
        title: "A Promise for Forever",
        description: "Now, with joyful hearts and hopeful eyes, we\u2019re stepping into the next chapter. This wedding isn\u2019t just a celebration of a day\u2014it\u2019s a celebration of a journey, a promise, and the love we\u2019re lucky enough to call our own."
      }
    ]
  },
  gallery: {
    title: "Our Moments",
    photos: [
      { src: "https://wp.envelope.id/wp-content/uploads/2026/01/inv_787_OhdTs2A4.jpg", type: "fullWidth" },
      { src: "https://wp.envelope.id/wp-content/uploads/2026/01/inv_787_XFlgAzTZ.jpg", type: "tall" },
      { src: "https://wp.envelope.id/wp-content/uploads/2026/01/inv_787_tIVJeYmu.jpg", type: "tall" },
      { src: "https://wp.envelope.id/wp-content/uploads/2026/01/inv_787_nJsu7TSV.jpg", type: "fullWidth" },
    ]
  },
  gift: {
    title: "Wedding Gift",
    description: "We\u2019re so grateful for your love and support, any gift you share means the world to us.",
  },
  closing: {
    message: "We can\u2019t wait to share this special moment with you. Your presence will make our day even more meaningful.",
    couplePhoto: "https://wp.envelope.id/wp-content/uploads/2026/01/inv_787_uIqyx2k4.jpg",
    coupleName: "Vincent &\nNatasha",
  },
  footer: {
    brand: "\u00e9nvelope.id",
    phone: "0822-1122-5002",
    website: "envelope.id",
    instagram: "envelope.id",
  }
};

export function DemoSunny() {
  return (
    <div style={{ backgroundColor: '#222' }}>
      <SunnyTemplate data={dummyData} />
    </div>
  );
}
