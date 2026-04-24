import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/lib/constants'

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden" id="cta-banner">
      <div className="container-wide section-padding">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative bg-navy rounded-3xl px-8 py-16 lg:px-16 lg:py-20 overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-terracotta/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-white/5 blur-[60px]" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-white text-balance">
              Siap membangun kehadiran digitalmu?
            </h2>
            <p className="text-white/60 mt-4 text-lg max-w-lg">
              Bangun undangan digital yang rapi, cepat, dan mudah dikelola bersama {BRAND.name}.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to="/daftar" id="cta-banner-register">
                <Button
                  size="lg"
                  className="bg-terracotta hover:bg-terracotta-hover text-white rounded-xl h-12 px-8 text-base group"
                >
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-280" />
                </Button>
              </Link>
              <a href="#harga" id="cta-banner-pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl h-12 px-8 text-base border-white/20 text-white hover:bg-white/10"
                >
                  Lihat Harga
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
