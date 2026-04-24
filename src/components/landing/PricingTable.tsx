import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PricingPlan {
  name: string
  price: number
  period: string
  badge?: string
  features: { text: string; included: boolean }[]
}

interface ProductPricingSectionProps {
  productId: string
  basic: PricingPlan
  pro: PricingPlan
}

export function ProductPricingSection({ productId, basic, pro }: ProductPricingSectionProps) {
  const plans = [
    { key: 'basic', plan: basic, isPro: false },
    { key: 'pro', plan: pro, isPro: true },
  ]

  return (
    <section className="section-padding bg-muted/30" id="harga">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="label-text text-accent text-xs block mb-3">Harga</span>
          <h2 className="text-foreground mx-auto max-w-lg">
            Pilih paket yang sesuai kebutuhanmu
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Tanpa biaya tersembunyi. Upgrade atau downgrade kapan saja.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map(({ key, plan, isPro }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <div
                className={cn(
                  'rounded-2xl border p-6 lg:p-8 h-full flex flex-col relative overflow-hidden',
                  isPro
                    ? 'border-accent bg-card shadow-xl shadow-accent/5'
                    : 'border-border bg-card'
                )}
              >
                {isPro && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-terracotta via-accent to-terracotta" />
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-heading text-foreground">{plan.name}</h3>
                    {plan.badge && (
                      <Badge className="bg-accent/10 text-accent border-0 text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl lg:text-4xl font-heading text-foreground price-text">
                      {formatRupiah(plan.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          feature.included ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to={`/daftar?product=${productId}&tier=${key}`} id={`pricing-cta-${productId}-${key}`}>
                  <Button
                    className={cn(
                      'w-full h-12 rounded-xl text-base',
                      isPro
                        ? 'bg-accent hover:bg-terracotta-hover text-white'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    )}
                  >
                    Pilih {plan.name}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
