import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Rizky & Amelia',
    role: 'Pengantin – SapaTamu',
    message: 'Undangan digital kami jadi bahan perbincangan keluarga. Tamunya sampai nanya, "Ini bikinnya sendiri?" Padahal tinggal isi form doang.',
    avatar: 'RA',
  },
  {
    id: 2,
    name: 'Ratna Sari',
    role: 'Pemilik UMKM – EtalasePro',
    message: 'Dulu jualan cuma lewat WhatsApp, sekarang punya katalog online yang rapi. Pelanggan jadi lebih percaya, omzet naik 40% dalam 3 bulan pertama.',
    avatar: 'RS',
  },
  {
    id: 3,
    name: 'Hendra Wijaya',
    role: 'Direktur – CitraKorpora',
    message: 'Company profile kami jadi terlihat lebih profesional. Klien dari luar kota bilang mereka langsung yakin setelah lihat website kami.',
    avatar: 'HW',
  },
  {
    id: 4,
    name: 'Bu Siti Nurhaliza',
    role: 'Kepala Sekolah – EduGerbang',
    message: 'Orang tua murid jadi lebih mudah mengakses informasi sekolah. Pengumuman, jadwal, galeri kegiatan — semua ada di satu tempat.',
    avatar: 'SN',
  },
]

export function TestimonialSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="section-padding bg-muted/30 relative overflow-hidden" id="testimoni">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="label-text text-accent text-xs block mb-3">Testimoni</span>
          <h2 className="text-foreground max-w-lg">
            Kata mereka yang sudah merasakan
          </h2>
        </motion.div>

        <div className="max-w-2xl">
          <div className="relative min-h-[200px]">
            <Quote className="w-12 h-12 text-accent/15 absolute -top-2 -left-2" />

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={current}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 pl-4"
              >
                <p className="text-lg lg:text-xl text-foreground leading-relaxed font-heading italic">
                  "{testimonials[current].message}"
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-medium">
                    {testimonials[current].avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{testimonials[current].name}</p>
                    <p className="text-xs text-muted-foreground">{testimonials[current].role}</p>
                  </div>
                </div>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-accent' : 'w-1.5 bg-border hover:bg-muted-foreground/30'
                }`}
                aria-label={`Testimoni ${i + 1}`}
                id={`testimonial-dot-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
