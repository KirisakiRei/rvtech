import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Building2, GraduationCap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRODUCTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, ShoppingBag, Building2, GraduationCap,
}

export function ProductShowcase() {
  return (
    <section className="relative" id="produk">
      <div className="container-wide section-padding pb-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <span className="label-text text-accent text-xs block mb-3">Ekosistem Digital</span>
          <h2 className="text-foreground mx-auto max-w-2xl">
            Empat solusi, satu platform tanpa batas
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Setiap produk dirancang khusus untuk kebutuhan spesifik. Pilih yang paling cocok untukmu.
          </p>
        </motion.div>
      </div>

      <div className="space-y-0">
        {PRODUCTS.map((product, i) => {
          const Icon = iconMap[product.icon] || Heart
          const isEven = i % 2 === 0

          return (
            <section
              key={product.id}
              className={cn(
                'section-padding overflow-hidden',
                i % 2 !== 0 && 'bg-muted/30'
              )}
            >
              <div className="container-wide">
                <div className={cn(
                  'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center',
                  !isEven && 'lg:grid-flow-col-dense'
                )}>
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                    className={cn(!isEven && 'lg:col-start-2')}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${product.color}12`, color: product.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className="text-xs font-semibold tracking-wider uppercase"
                        style={{ color: product.color }}
                      >
                        {product.tagline}
                      </span>
                    </div>

                    <h2 className="text-foreground mb-4 text-balance">
                      {product.headline}
                    </h2>

                    <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg">
                      {product.longDescription}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
                      {product.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: product.color }}
                          />
                          {highlight}
                        </div>
                      ))}
                    </div>

                    <Link to={product.href} id={`product-cta-${product.id}`}>
                      <Button
                        size="lg"
                        className="rounded-xl h-12 px-8 text-base group"
                        style={{ backgroundColor: product.color, color: '#FFFFFF' }}
                      >
                        Lihat {product.name}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-280" />
                      </Button>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                    className={cn(
                      'relative',
                      !isEven && 'lg:col-start-1 lg:row-start-1'
                    )}
                  >
                    <div className="relative">
                      <div
                        className="absolute -inset-4 rounded-3xl opacity-[0.07] blur-xl"
                        style={{ backgroundColor: product.color }}
                      />
                      <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                        <img
                          src={product.image}
                          alt={`${product.name} — ${product.tagline}`}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>

                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -bottom-3 -right-3 bg-card border border-border rounded-xl shadow-lg px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: product.color }}
                          />
                          <span className="text-xs font-medium text-foreground">
                            {product.name}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
