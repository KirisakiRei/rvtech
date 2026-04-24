import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const dur = 2000
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / dur, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, hasAnimated])

  return (
    <span ref={ref} className="price-text">
      {count.toLocaleString('id-ID')}{suffix}
    </span>
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      id="hero"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-terracotta/5 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full bg-navy/5 blur-[80px]" />
        <div className="absolute top-[40%] left-[50%] w-[200px] h-[200px] rounded-full bg-warning/5 blur-[60px]" />
      </div>

      <motion.div style={{ y, opacity }} className="container-wide relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          <div className="lg:col-span-7 xl:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta-soft text-terracotta text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Platform WaaS Pertama di Indonesia
              </div>

              <h1 className="text-foreground mb-6 text-balance">
                Bukan sekadar <br className="hidden sm:block" />
                <span className="relative inline-block">
                  website biasa
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="var(--terracotta)" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Dari undangan digital yang bikin tamu terharu, hingga toko online yang bikin pembeli percaya.
                Satu platform, empat solusi, tanpa repot ngoding.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/daftar" id="hero-cta-primary">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-terracotta-hover text-white rounded-xl h-12 px-8 text-base group"
                  >
                    Mulai Gratis
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-280" />
                  </Button>
                </Link>
                <a href="#produk" id="hero-cta-secondary">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl h-12 px-8 text-base border-border hover:bg-muted"
                  >
                    Lihat Produk
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex gap-8 mt-12"
            >
              {[
                { value: 150, suffix: '+', label: 'Klien Aktif' },
                { value: 8, suffix: '', label: 'Tema Premium' },
                { value: 99, suffix: '%', label: 'Kepuasan' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl lg:text-3xl font-heading text-foreground">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-5 xl:col-span-6 relative h-[450px] lg:h-[650px] flex items-center justify-center mt-12 lg:mt-0">
             
             {/* Center Glow Ambient */}
             <div className="absolute w-[70%] h-[70%] bg-gradient-to-tr from-accent/20 via-terracotta/20 to-warning/10 rounded-full blur-[100px] opacity-70" />

             {/* The Graphic Stack Container */}
             <div className="relative w-full max-w-[320px] lg:max-w-[420px] aspect-[4/3] group perspective-1000">
                
                {/* 4th Product (Back) - EduGerbang */}
                <motion.div 
                  initial={{ opacity: 0, x: 45, y: -45, scale: 0.85 }}
                  animate={{ opacity: 1, x: 45, y: -45, scale: 0.85 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                  className="absolute inset-0 z-10 rounded-3xl overflow-hidden border border-white/20 shadow-xl opacity-60 group-hover:translate-x-16 group-hover:-translate-y-16 group-hover:rotate-3 transition-all duration-500 ease-out"
                >
                  <img src="/images/edu-clean.png" alt="EduGerbang Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                     <p className="text-white font-bold text-sm tracking-wide">EduGerbang</p>
                  </div>
                </motion.div>

                {/* 3rd Product (Middle Back) - CitraKorpora */}
                <motion.div 
                  initial={{ opacity: 0, x: 30, y: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 30, y: -30, scale: 0.9 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 z-20 rounded-3xl overflow-hidden border border-white/20 shadow-xl opacity-80 group-hover:translate-x-10 group-hover:-translate-y-10 group-hover:rotate-2 transition-all duration-500 ease-out"
                >
                  <img src="/images/citra-clean.png" alt="CitraKorpora Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                     <p className="text-white font-bold text-sm tracking-wide">CitraKorpora</p>
                  </div>
                </motion.div>

                {/* 2nd Product (Middle Front) - EtalasePro */}
                <motion.div 
                  initial={{ opacity: 0, x: 15, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, x: 15, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  className="absolute inset-0 z-30 rounded-[2rem] overflow-hidden border border-white/30 shadow-2xl group-hover:translate-x-4 group-hover:-translate-y-4 group-hover:rotate-1 transition-all duration-500 ease-out"
                >
                  <img src="/images/etalase-clean.png" alt="EtalasePro Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                     <p className="text-white font-bold text-base tracking-wide">EtalasePro</p>
                  </div>
                </motion.div>

                {/* 1st Product (Front) - SapaTamu */}
                <motion.div 
                  initial={{ opacity: 0, x: 0, y: 0, scale: 1 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute inset-0 z-40 rounded-[2rem] overflow-hidden border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.2)] group-hover:scale-105 transition-all duration-500 ease-out"
                >
                  <img src="/images/sapa-clean.png" alt="SapaTamu Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                     <p className="text-white font-bold text-lg tracking-wide">SapaTamu</p>
                  </div>
                </motion.div>
                
             </div>

          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-border rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-muted-foreground rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}
