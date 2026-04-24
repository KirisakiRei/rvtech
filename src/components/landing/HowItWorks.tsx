import { motion } from 'framer-motion'
import { MousePointerClick, Palette, Send } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: MousePointerClick,
    title: 'Pilih & Daftar',
    description: 'Pilih produk yang kamu butuhkan, tentukan paket harga, dan buat akun dalam hitungan detik.',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Isi & Desain',
    description: 'Masuk ke CMS, pilih tema, isi konten, dan lihat hasilnya langsung secara real-time di Live Preview.',
  },
  {
    number: '03',
    icon: Send,
    title: 'Sebarkan & Pantau',
    description: 'Bagikan link website-mu ke seluruh dunia. Pantau pengunjung, RSVP, dan statistik dari dashboard.',
  },
]

export function HowItWorks() {
  return (
    <section className="section-padding bg-muted/30 relative overflow-hidden" id="cara-kerja">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="label-text text-accent text-xs block mb-3">Cara Kerja</span>
          <h2 className="text-foreground mx-auto max-w-lg">
            Tiga langkah menuju kehadiran digital
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-[16.66%] right-[16.66%] h-px bg-border -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 relative z-10 h-full">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <step.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-4xl font-heading text-border/60">{step.number}</span>
                  </div>

                  <h3 className="text-lg font-heading text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
