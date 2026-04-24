import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Heart, ArrowUpRight } from 'lucide-react'
import { PRODUCTS, BRAND } from '@/lib/constants'
import { BrandLogo } from '@/components/branding/BrandLogo'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white/90 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terracotta/40 to-transparent" />

      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link to="/" className="inline-block mb-4" id="footer-logo">
              <BrandLogo theme="dark" showTagline />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {BRAND.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="label-text text-white/40 mb-5 text-xs">Produk</h4>
            <ul className="space-y-3">
              {PRODUCTS.map((product) => (
                <li key={product.id}>
                  <Link
                    to={product.href}
                    className="text-sm text-white/70 hover:text-white transition-colors duration-280 flex items-center gap-2 group"
                    id={`footer-${product.id}`}
                  >
                    {product.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-280" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="label-text text-white/40 mb-5 text-xs">Dukungan</h4>
            <ul className="space-y-3">
              {['Pusat Bantuan', 'Panduan Penggunaan', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-white/70 hover:text-white transition-colors duration-280"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="label-text text-white/40 mb-5 text-xs">Newsletter</h4>
            <p className="text-sm text-white/60 mb-4">
              Dapatkan update fitur terbaru dan tips pembuatan website.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
              id="footer-newsletter-form"
            >
              <input
                type="email"
                placeholder="email@kamu.com"
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-terracotta/50 transition-colors duration-280"
                aria-label="Alamat email untuk newsletter"
                id="footer-newsletter-input"
              />
              <button
                type="submit"
                className="bg-terracotta hover:bg-terracotta-hover text-white p-2 rounded-lg transition-colors duration-280"
                aria-label="Kirim newsletter"
                id="footer-newsletter-submit"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>

        <div className="mt-16 pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            {currentYear} {BRAND.name}. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-white/40 flex items-center gap-1">
            Dibuat dengan <Heart className="w-3 h-3 text-terracotta inline" /> di Indonesia
          </p>
        </div>
      </div>
    </footer>
  )
}
