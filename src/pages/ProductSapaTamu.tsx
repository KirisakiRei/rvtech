import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Palette, Users, Send, Music, Gift, PlayCircle, Check, X } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductScrollFeatures } from '@/components/landing/ProductScrollFeatures'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { BRAND, PRODUCTS, formatRupiah } from '@/lib/constants'
import { cn } from '@/lib/utils'

const features = [
  { icon: Palette, title: 'Katalog Premium', description: 'Dari minimalis statis hingga full motion, dipilih khusus oleh desainer.', image: '/images/sapa_feat_1.png' },
  { icon: Heart, title: 'Split View Editor', description: 'Isi form di kiri, lihat hasilnya langsung di preview mockup mobile sebelah kanan.', image: '/images/sapa_feat_2.png' },
  { icon: Users, title: 'RSVP & Buku Tamu', description: 'Tamu bisa konfirmasi kehadiran dan kirim ucapan langsung dari undangan.', image: '/images/sapa_feat_3.png' },
  { icon: Send, title: 'Broadcast WhatsApp', description: 'Generate link personal untuk setiap tamu dan kirim langsung via WhatsApp. Satu klik.', image: '/images/sapa_feat_4.png' },
  { icon: Music, title: 'Background Music', description: 'Tambahkan lagu favorit yang otomatis berputar saat tamu membuka undangan.', image: '/images/sapa_feat_5.png' },
  { icon: Gift, title: 'Digital Angpao', description: 'Tamu bisa memberikan amplop digital langsung. Rekening terpampang jelas dan aman.', image: '/images/sapa_feat_6.png' },
]

// Mock Data for Catalog Section
const CATALOG_TEMPLATES = {
  basic: [
    { id: 'minimalist', name: 'Clean Minimalist', description: 'Desain bersih dan modern dengan tipografi kuat.', image: '/themes/minimalist.jpg' },
    { id: 'floral', name: 'Floral Garden', description: 'Nuansa taman bunga romantis dan estetik.', image: '/themes/floral.jpg' },
    { id: 'tradisional', name: 'Nusantara Heritage', description: 'Keindahan motif batik yang tak lekang waktu.', image: '/themes/tradisional.jpg' },
    { id: 'monochrome', name: 'Monochrome', description: 'Klasik minimalis hitam-putih nan elegan.', image: '/themes/bnw.jpg' },
  ],
  luxury: [
    { id: 'cinematic', name: 'Cinematic Loop', description: 'Video latar belakang yang bergerak tenang.', image: '/themes/modern.jpg' },
    { id: 'anime', name: 'Kawaii Story', description: 'Ilustrasi anime dengan mikro-animasi halus.', image: '/themes/anime.jpg' },
  ],
  royal: [
    { id: 'sunny', name: 'Sunny Day (Full-Motion)', description: 'Pengalaman interaktif parallax-scroll eksklusif memukau tamu undangan Anda.', image: '/themes/gallery.jpg' },
  ]
}

// Pricing 3 Tiers Data
const PRICING_TIERS = [
  {
    id: 'basic',
    name: 'Basic Tier',
    price: 59000,
    description: 'Sempurna untuk undangan elegan, simpel, dan cepat.',
    features: [
      { text: 'Akses seluruh Template Basic (Statis)', included: true },
      { text: 'Formulir RSVP & Buku Tamu', included: true },
      { text: 'Galeri Foto (Up to 10)', included: true },
      { text: 'Video Background (Motion)', included: false },
      { text: 'Full-Motion Scrolling Engine', included: false },
    ]
  },
  {
    id: 'luxury',
    name: 'Luxury Tier',
    price: 149000,
    badge: 'Paling Diminati',
    description: 'Bawa undangan Anda lebih hidup dengan animasi dan video.',
    features: [
      { text: 'Akses seluruh Template Luxury', included: true },
      { text: 'Formulir RSVP & Buku Tamu', included: true },
      { text: 'Galeri Foto Unlimited', included: true },
      { text: 'Video Background (Motion)', included: true },
      { text: 'Full-Motion Scrolling Engine', included: false },
    ]
  },
  {
    id: 'royal',
    name: 'Royal Tier',
    price: 259000,
    badge: 'Premium Experience',
    description: 'Sebuah mahakarya. Interaktivitas penuh yang membuat tamu terpukau.',
    features: [
      { text: 'Akses eksklusif Template Royal', included: true },
      { text: 'Formulir RSVP & Buku Tamu VIP', included: true },
      { text: 'Galeri Foto Unlimited', included: true },
      { text: 'Premium Background Music', included: true },
      { text: 'Full-Motion Scrolling Engine', included: true },
    ]
  }
]

// FAQ Data
const FAQS = [
  { 
    q: 'Bagaimana cara order?', 
    a: 'Sangat mudah. Pilih tier dan template dari katalog kami, lalu klik tombol "Pesan Sekarang". Setelah itu, Anda akan diarahkan untuk mengisi formulir pemesanan dan melakukan pembayaran. Setelah konfirmasi, undangan digital Anda akan segera diproses.' 
  },
  { 
    q: 'Berapa lama proses pembuatan undangan?', 
    a: 'Normalnya, undangan akan selesai dalam waktu 1x24 jam setelah data form lengkap dan pembayaran terkonfirmasi. Proses bisa lebih cepat tergantung pada kelengkapan data yang Anda berikan.' 
  },
  { 
    q: 'Apakah ada batas revisi?', 
    a: 'Tidak ada batasan revisi (Unlimited Revisi) untuk teks, lokasi, dan foto melalui dashboard pengantin Sapatamu, asalkan dilakukan sebelum H-1 acara. Namun, penggantian tema keseluruhan setelah pesanan diproses tidak diperkenankan.' 
  },
  { 
    q: 'Apakah bisa ganti musik sesuai request?', 
    a: 'Ya, Anda bisa mengganti musik latar belakang (background music) sesuai dengan lagu pilihan Anda sendiri untuk tier Luxury dan Royal. Anda cukup melampirkan file musik atau membagikan link YouTube lagunya pada form pemesanan.' 
  },
  { 
    q: 'Apakah saya akan dibantu selama proses pembuatan undangan?', 
    a: `Tentu saja. Jika Anda mengalami kesulitan dalam mengunggah foto, mengatur peta lokasi, atau memiliki pertanyaan seputar fitur, tim support/asisten visual ${BRAND.name} siap mendampingi Anda hingga undangan siap digunakan.` 
  },
  { 
    q: `Kapan saya bisa menghubungi ${BRAND.name}?`, 
    a: 'Layanan pelanggan dan tim support kami aktif pada hari Senin - Sabtu pukul 09.00 - 17.00 WIB. Pertanyaan di luar jam operasional akan dijawab secepatnya keesokan harinya.' 
  }
]

export function ProductSapaTamu() {
  const navigate = useNavigate()
  const product = PRODUCTS.find((p) => p.id === 'sapatamu')!

  const handlePreviewClick = (templateId: string) => {
    if (templateId === 'sunny') {
      window.open('/demo-sunny', '_blank')
    } else {
      alert('Katalog Preview ini belum tersedia. Silakan klik "Preview" pada tipe "Sunny Day" di tab Royal.')
    }
  }

  return (
    <>
      <Navbar />
      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-[100svh] flex items-center pt-24 pb-16 overflow-hidden bg-background">
          <div className="absolute top-0 right-0 w-full lg:w-[58%] h-full z-0 p-0 lg:py-6 lg:pr-0 pl-0">
            <div className="w-full h-full relative lg:rounded-l-[250px] overflow-hidden lg:shadow-[-30px_0_100px_-20px_rgba(0,0,0,0.15)] border-l lg:border-white/40">
              <img
                src="/images/sapa-clean.png"
                alt={product.name}
                className="w-full h-full object-cover object-center lg:object-left"
              />
              <div className="absolute inset-0 bg-accent/5 mix-blend-multiply pointer-events-none" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-background via-background/90 to-transparent lg:hidden pointer-events-none" />
          </div>

          <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <div className="container-wide relative z-10 w-full">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[60vh]">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-5 max-w-xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta-soft text-terracotta text-xs font-medium mb-6">
                  <Heart className="w-3.5 h-3.5" />
                  {product.tagline}
                </div>

                <h1 className="text-5xl lg:text-7xl font-heading text-foreground leading-[1.05] mb-6 tracking-tight drop-shadow-sm">
                  {product.headline}
                </h1>
                <p className="text-lg text-foreground/80 leading-relaxed mb-10 max-w-md">
                  {product.longDescription}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/daftar?product=sapatamu&tier=basic" id="sapatamu-hero-cta" className="w-full sm:w-auto">
                    <Button size="lg" className="bg-accent hover:bg-terracotta-hover text-white rounded-xl h-14 px-8 text-base font-medium transition-all w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                      Pesan Sekarang
                    </Button>
                  </Link>
                  <a href="#katalog" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="rounded-xl h-14 px-8 text-base w-full border-2 bg-background/50 backdrop-blur-sm hover:bg-background">
                      Lihat Katalog
                    </Button>
                  </a>
                </div>
              </motion.div>

              <div className="lg:col-span-7 relative h-full min-h-[400px] hidden lg:block">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute top-[15%] right-[5%] z-20 bg-background/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 flex items-center gap-4 w-[260px] cursor-default hover:scale-105 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0 border border-success/20">
                    <Heart className="w-5 h-5 text-success fill-success/20" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">Desain Elegan</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Tersedia Beragam Tema Premium</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="absolute bottom-[20%] left-[10%] z-20 bg-background/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 flex items-center gap-4 w-[250px] cursor-default hover:scale-105 transition-transform origin-bottom-left"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                    <Users className="w-5 h-5 text-accent fill-accent/20" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">RSVP & Buku Tamu</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Manajemen Tamu Cerdas</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES OVERVIEW */}
        <ProductScrollFeatures 
          features={features}
          color={product.color}
          title="Semua yang kamu butuhkan untuk undangan sempurna"
          subtitle="Fitur Unggulan"
        />

        {/* CATALOG TABS SECTION */}
        <section className="section-padding bg-muted/10 border-y" id="katalog">
          <div className="container-wide">
             <div className="text-center mb-12">
              <span className="label-text text-accent text-xs block mb-3">Katalog Desain</span>
              <h2 className="text-foreground mx-auto max-w-lg mb-4">
                Pilih Tipe Undangan Anda
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Tersedia dari tingkat basic yang berkesan simpel, hingga royal yang memanjakan mata melalui full-motion interaction.
              </p>
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="bg-background border shadow-sm h-12 p-1 rounded-xl">
                  <TabsTrigger value="basic" className="rounded-lg px-8 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all">Basic</TabsTrigger>
                  <TabsTrigger value="luxury" className="rounded-lg px-8 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all">Luxury</TabsTrigger>
                  <TabsTrigger value="royal" className="rounded-lg px-8 text-sm data-[state=active]:bg-accent data-[state=active]:text-white font-medium transition-all">Royal</TabsTrigger>
                </TabsList>
              </div>

              {Object.entries(CATALOG_TEMPLATES).map(([tierKey, templates]) => (
                <TabsContent key={tierKey} value={tierKey} className="mt-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  >
                    {templates.map((tpl) => (
                      <div key={tpl.id} className="group flex flex-col bg-background border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                        {/* Image Preview Area */}
                        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                           {/* Decorative frame overlay mimicking mobile device */}
                           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[90%] border-[4px] border-black/80 rounded-2xl z-20 pointer-events-none shadow-2xl opacity-60 mix-blend-overlay"></div>
                           <img src={tpl.image} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                           
                           <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <Button 
                               onClick={() => handlePreviewClick(tpl.id)} 
                               className="bg-white hover:bg-white text-black rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-all font-medium"
                             >
                               <PlayCircle className="w-4 h-4 mr-2" /> Preview
                             </Button>
                           </div>
                        </div>
                        {/* Meta */}
                        <div className="p-5 flex-1 flex flex-col">
                          <h4 className="font-heading text-lg font-semibold text-foreground">{tpl.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1 mb-4 leading-relaxed line-clamp-2">{tpl.description}</p>
                          <div className="mt-auto">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                              {tierKey} TIER
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* PRICING 3 TIERS */}
        <section className="section-padding" id="harga">
          <div className="container-narrow">
            <div className="text-center mb-16">
              <span className="label-text text-accent text-xs block mb-3">Harga & Paket</span>
              <h2 className="text-foreground mx-auto max-w-lg">
                Pilih paket sesuai impian Anda
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING_TIERS.map((tier, i) => {
                const isRoyal = tier.id === 'royal';
                
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                  >
                    <div className={cn(
                      'rounded-2xl border p-6 flex flex-col h-full relative overflow-hidden transition-all',
                      isRoyal ? 'bg-accent/5 border-accent shadow-xl shadow-accent/10' : 'bg-card border-border hover:shadow-md'
                    )}>
                      {tier.badge && (
                        <div className="absolute top-0 right-0">
                          <div className={cn(
                            "text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-lg text-white",
                             isRoyal ? "bg-accent" : "bg-primary"
                          )}>
                            {tier.badge}
                          </div>
                        </div>
                      )}

                      <h3 className="font-heading text-xl font-semibold mt-4">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">{tier.description}</p>
                      
                      <div className="my-6">
                        <span className="text-3xl font-heading font-bold">{formatRupiah(tier.price)}</span>
                      </div>

                      <div className="space-y-3 mb-8 flex-1">
                        {tier.features.map((feature, idx) => (
                           <div key={idx} className="flex gap-3 text-sm items-start">
                             {feature.included ? (
                               <div className="bg-success/10 p-1 rounded-full text-success mt-0.5 shrink-0">
                                 <Check className="w-3 h-3" />
                               </div>
                             ) : (
                               <div className="bg-muted p-1 rounded-full text-muted-foreground mt-0.5 shrink-0">
                                 <X className="w-3 h-3" />
                               </div>
                             )}
                             <span className={cn(feature.included ? "text-foreground" : "text-muted-foreground line-through opacity-70")}>
                               {feature.text}
                             </span>
                           </div>
                        ))}
                      </div>

                      <Button 
                        onClick={() => navigate(`/daftar?product=sapatamu&tier=${tier.id}`)}
                        className={cn(
                          "w-full rounded-xl h-12 font-medium",
                          isRoyal ? "bg-accent hover:bg-terracotta-hover text-white shadow-lg" : "bg-secondary text-foreground hover:bg-secondary/80"
                        )}
                      >
                        Pilih {tier.name}
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-muted/30 border-t" id="faq">
          <div className="container-narrow">
            <div className="text-center mb-10">
              <span className="label-text text-accent text-xs block mb-3">FAQ</span>
              <h2 className="text-foreground">Pertanyaan yang Sering Diajukan</h2>
            </div>
            
            <div className="max-w-2xl mx-auto bg-card border rounded-2xl p-6 shadow-sm">
              {/* @ts-ignore */}
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b last:border-0">
                    <AccordionTrigger className="text-left font-medium text-[15px] hover:text-accent transition-colors">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
