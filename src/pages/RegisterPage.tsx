import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { PRODUCTS, PRICING, formatRupiah } from '@/lib/constants'
import { BrandLogo } from '@/components/branding/BrandLogo'
import { getPublicErrorMessage } from '@/lib/error'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const productId = searchParams.get('product') || 'sapatamu'
  const tierId = (searchParams.get('tier') || 'pro') as 'basic' | 'pro'
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0]
  const plan = PRICING[tierId]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password) {
      setError('Semua field wajib diisi')
      return
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    try {
      await register(name, email, password)
      navigate('/cms')
    } catch (error) {
      setError(getPublicErrorMessage(error, 'Gagal mendaftar. Silakan coba lagi.'))
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-navy relative overflow-hidden p-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] right-[10%] w-[250px] h-[250px] rounded-full bg-terracotta/10 blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full w-full max-w-md">
          <Link to="/" className="inline-block">
            <BrandLogo theme="dark" showTagline />
          </Link>

          <div>
            <Badge className="bg-terracotta/20 text-terracotta border-0 mb-4">
              {product.name} - {plan.name}
            </Badge>
            <h2 className="text-white text-2xl font-heading leading-tight mb-3">
              Mulai membangun dengan {product.name}
            </h2>
            <p className="text-white/50 mb-6">{product.description}</p>

            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-heading text-white price-text">{formatRupiah(plan.price)}</span>
                <span className="text-sm text-white/40">{plan.period}</span>
              </div>
              <ul className="space-y-2">
                {plan.features
                  .filter((feature) => feature.included)
                  .slice(0, 5)
                  .map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      {feature.text}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-white/30">Pembayaran diproses setelah akun dibuat</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-6">
            <Link to="/">
              <BrandLogo compact />
            </Link>
            <Badge className="bg-accent/10 text-accent border-0 mt-3 block w-fit">
              {product.name} - {plan.name} - {formatRupiah(plan.price)}
              {plan.period}
            </Badge>
          </div>

          <h1 className="text-2xl font-heading text-foreground mb-2">Buat Akun</h1>
          <p className="text-muted-foreground mb-8">Isi data berikut untuk memulai</p>

          {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            <div className="space-y-2">
              <Label htmlFor="register-name" className="label-text text-xs">
                Nama Lengkap
              </Label>
              <Input
                id="register-name"
                type="text"
                placeholder="Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-lg"
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email" className="label-text text-xs">
                Email
              </Label>
              <Input
                id="register-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg"
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password" className="label-text text-xs">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg pr-10"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm" className="label-text text-xs">
                Konfirmasi Password
              </Label>
              <Input
                id="register-confirm"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-lg"
                aria-required="true"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-accent hover:bg-terracotta-hover text-white rounded-lg text-base group mt-2"
              id="register-submit"
            >
              {isLoading ? 'Membuat akun...' : 'Daftar Sekarang'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-280" />}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Sudah punya akun?{' '}
            <Link to="/masuk" className="text-accent hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
