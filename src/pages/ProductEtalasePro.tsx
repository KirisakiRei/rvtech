import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, Image, MessageCircle, BarChart3, Tag } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductPricingSection } from '@/components/landing/PricingTable'
import { ProductScrollFeatures } from '@/components/landing/ProductScrollFeatures'
import { Button } from '@/components/ui/button'
import { PRODUCTS, PRODUCT_PRICING } from '@/lib/constants'

const features = [
  { icon: Package, title: 'Katalog Produk Digital', description: 'Tampilkan semua produkmu dalam grid yang rapi dan profesional. Harga, deskripsi, dan foto — semua terorganisir.' },
  { icon: Image, title: 'Upload Foto Multi-Angle', description: 'Setiap produk bisa punya beberapa foto dari berbagai sudut. Buat pelanggan yakin sebelum beli.' },
  { icon: Tag, title: 'Badge & Kategori', description: 'Tandai produk dengan badge Sale, New, atau Bestseller. Kelompokkan dalam kategori kustom.' },
  { icon: MessageCircle, title: 'Tombol WhatsApp', description: 'Setiap produk punya tombol langsung ke WhatsApp. Pelanggan tinggal klik, chat langsung masuk.' },
  { icon: BarChart3, title: 'Analitik Pengunjung', description: 'Ketahui berapa banyak orang yang melihat tokomu dan produk mana yang paling diminati.' },
  { icon: ShoppingBag, title: 'Profil Toko Premium', description: 'Halaman toko dengan logo, deskripsi, jam operasional, dan informasi kontak yang lengkap.' },
]

export function ProductEtalasePro() {
  const product = PRODUCTS.find((p) => p.id === 'etalasepro')!
  const pricing = PRODUCT_PRICING.etalasepro

  return (
    <>
      <Navbar />
      <main>
        <section className="relative min-h-[100svh] flex items-center pt-24 pb-16 overflow-hidden bg-background">
          {/* Full Bleed Image Background with Curved Edge & Dimension */}
          <div className="absolute top-0 right-0 w-full lg:w-[58%] h-full z-0 p-0 lg:py-6 lg:pr-0 pl-0">
            <div className="w-full h-full relative lg:rounded-l-[250px] overflow-hidden lg:shadow-[-30px_0_100px_-20px_rgba(0,0,0,0.15)] border-l lg:border-white/40">
              <img
                src="/images/etalase-clean.png"
                alt={product.name}
                className="w-full h-full object-cover object-center lg:object-left"
              />
              <div className="absolute inset-0" style={{ backgroundColor: `${product.color}0A`, mixBlendMode: 'multiply' }} />
            </div>
            {/* Gradient Mask for Mobile Stacking */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-background via-background/90 to-transparent lg:hidden pointer-events-none" />
          </div>

          {/* Decorative left-side gradient glow */}
          <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] -z-10 pointer-events-none" style={{ backgroundColor: `${product.color}10` }} />

          <div className="container-wide relative z-10 w-full">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[60vh]">
              
              {/* Left Content Column */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-5 max-w-xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ backgroundColor: `${product.color}15`, color: product.color }}>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {product.tagline}
                </div>

                <h1 className="text-5xl lg:text-7xl font-heading text-foreground leading-[1.05] mb-6 tracking-tight drop-shadow-sm">
                  {product.headline}
                </h1>
                <p className="text-lg text-foreground/80 leading-relaxed mb-10 max-w-md">
                  {product.longDescription}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/daftar?product=etalasepro&tier=pro" id="etalasepro-hero-cta" className="w-full sm:w-auto">
                    <Button size="lg" className="rounded-xl h-14 px-8 text-base font-medium transition-all w-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5" style={{ backgroundColor: product.color }}>
                      Buat Sekarang
                    </Button>
                  </Link>
                  <a href="#harga" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="rounded-xl h-14 px-8 text-base w-full border-2 bg-background/50 backdrop-blur-sm hover:bg-background">
                      Lihat Harga
                    </Button>
                  </a>
                </div>
              </motion.div>

              {/* Right Area: Floating Cards Grid Space */}
              <div className="lg:col-span-7 relative h-full min-h-[400px] hidden lg:block">
                {/* Floating Card 1 */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute top-[18%] right-[8%] z-20 bg-background/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 flex items-center gap-4 w-[240px] cursor-default hover:scale-105 transition-transform"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${product.color}15`, borderColor: `${product.color}30` }}>
                    <Tag className="w-5 h-5 fill-current/20" style={{ color: product.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">Badge Kustom</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Diskon & Terlaris</p>
                  </div>
                </motion.div>

                {/* Floating Card 2 */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="absolute bottom-[22%] left-[12%] z-20 bg-background/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 flex items-center gap-4 w-[250px] cursor-default hover:scale-105 transition-transform origin-bottom-left"
                >
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0 border border-success/20">
                    <MessageCircle className="w-5 h-5 text-success fill-success/20" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">Order via Chat</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Langsung Masuk WA</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <ProductScrollFeatures 
          features={features}
          color={product.color}
          title="Toko online yang bikin pelanggan percaya"
          subtitle="Fitur Unggulan"
        />

        <ProductPricingSection productId="etalasepro" basic={pricing.basic} pro={pricing.pro} />
      </main>
      <Footer />
    </>
  )
}
