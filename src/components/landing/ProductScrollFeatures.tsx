import { useRef, useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export interface ScrollFeature {
  icon: LucideIcon
  title: string
  description: string
  image?: string
}

interface Props {
  features: ScrollFeature[]
  color: string
  title: string
  subtitle: string
}

export function ProductScrollFeatures({ features, color, title, subtitle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Track scroll progress within this specific container
  // "start 80px" = top of container hits 80px (navbar height) from top of viewport
  // "end end" = bottom of container hits bottom of viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80px', 'end end'],
  })

  // Listen to the scroll progress and update active index
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Math.max guarantees we don't go below 0, Math.min prevents going above length-1
    // We multiply by features.length, but slightly adjust so the last item stays active longer
    const index = Math.min(
      features.length - 1,
      Math.max(0, Math.floor(latest * features.length * 0.99))
    )
    setActiveIndex(index)
  })

  // To allow click-to-scroll, we calculate approximate scroll position
  const handleFeatureClick = (index: number) => {
    if (!containerRef.current) return
    const containerTop = containerRef.current.offsetTop
    const containerHeight = containerRef.current.scrollHeight
    const scrollableDistance = containerHeight - window.innerHeight
    const targetScrollY = containerTop + (scrollableDistance * (index / Math.max(1, features.length - 1)))
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    })
  }

  return (
    <section 
      ref={containerRef} 
      className="relative bg-background" 
      style={{ height: `${features.length * 85}vh` }} 
    >
      <div className="sticky top-[80px] h-[calc(100vh-80px)] flex flex-col justify-start overflow-hidden py-4 sm:py-6 lg:py-6 bg-muted/20">
        <div className="container-wide w-full relative z-10 flex flex-col h-full">
          
          <div className="text-center mb-4 lg:mb-6 shrink-0">
            <span className="label-text text-xs block mb-1 lg:mb-2" style={{ color }}>{subtitle}</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading text-foreground mx-auto max-w-2xl tracking-tight leading-tight">
              {title}
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-10 flex-1 min-h-0">
             
             {/* Left Column: Visual/Image Representation */}
             <div className="relative w-full h-[35vh] lg:h-full lg:min-h-[300px] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl bg-card border border-border/50 order-2 lg:order-1">
                {features.map((feat, i) => {
                  const isActive = activeIndex === i
                  return (
                    <motion.div
                      key={`visual-${i}`}
                      className="absolute inset-0 flex items-center justify-center p-3 lg:p-4"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: isActive ? 1 : 0,
                        zIndex: isActive ? 10 : 0,
                      }}
                      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <div className="relative w-full h-full lg:rounded-[1.5rem] bg-background/60 overflow-hidden group">
                        
                        {feat.image ? (
                          <>
                            <img 
                              src={feat.image} 
                              alt={feat.title} 
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                            />
                            {/* Gradient Overlay for Text Visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                            <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8 z-10">
                              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center shadow-lg mb-3 lg:mb-4 backdrop-blur-md bg-white/20 border border-white/30 text-white" style={{ backgroundColor: `${color}90` }}>
                                <feat.icon className="w-5 h-5 lg:w-7 lg:h-7" />
                              </div>
                              <h4 className="text-xl lg:text-3xl font-heading text-white drop-shadow-md">{feat.title}</h4>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 border border-white/10 shadow-inner">
                            <motion.div 
                              className="absolute w-[150%] h-[150%] rounded-full blur-[100px] opacity-30 pointer-events-none" 
                              style={{ backgroundColor: color }}
                              animate={{ x: ['-20%', '20%', '-20%'], y: ['-20%', '20%', '-20%'] }}
                              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            />
                            <div className="w-16 h-16 lg:w-28 lg:h-28 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl relative z-10" style={{ backgroundColor: color }}>
                              <feat.icon className="w-8 h-8 lg:w-14 lg:h-14 text-white drop-shadow-md" />
                            </div>
                            <h4 className="text-lg lg:text-2xl font-bold text-foreground text-center relative z-10 px-4 mt-6">
                              {feat.title}
                            </h4>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
             </div>

             {/* Right Column: Accordion Features List */}
             <div className="flex flex-col justify-center gap-0.5 lg:gap-1 relative z-10 w-full order-1 lg:order-2 h-full py-1">
                {features.map((feat, i) => {
                  const isActive = activeIndex === i
                  return (
                    <div 
                      key={`text-${i}`} 
                      className={`relative pl-4 lg:pl-6 py-2 lg:py-2.5 transition-all duration-500 cursor-pointer group`}
                      onClick={() => handleFeatureClick(i)}
                    >
                      {/* Animated indicator line */}
                      <div 
                        className={`absolute left-0 top-0 w-1 rounded-full transition-all duration-500 ease-out`}
                        style={{ 
                          height: isActive ? '100%' : '30%',
                          top: isActive ? '0%' : '35%',
                          backgroundColor: isActive ? color : 'var(--border)',
                          opacity: isActive ? 1 : 0.4
                        }} 
                      />

                      <h3 
                        className={`text-lg lg:text-xl font-heading tracking-tight transition-all duration-500`} 
                        style={{ 
                          color: isActive ? color : 'var(--foreground)',
                          opacity: isActive ? 1 : 0.5
                        }}
                      >
                        {feat.title}
                      </h3>
                      
                      <motion.div
                        initial={false}
                        animate={{ 
                          height: isActive ? 'auto' : 0, 
                          opacity: isActive ? 1 : 0,
                          marginTop: isActive ? 4 : 0
                        }}
                        className="overflow-hidden"
                        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        <p className="text-sm lg:text-[15px] text-muted-foreground leading-relaxed max-w-lg mb-1">
                          {feat.description}
                        </p>
                      </motion.div>
                    </div>
                  )
                })}
             </div>

          </div>
        </div>
      </div>
    </section>
  )
}
