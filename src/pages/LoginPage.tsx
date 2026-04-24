import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'
import { BrandLogo } from '@/components/branding/BrandLogo'
import { ErrorNotice } from '@/components/feedback/ErrorNotice'
import { BRAND } from '@/lib/constants'
import { consumeSessionExpired } from '@/lib/api'
import { getPublicErrorMessage } from '@/lib/error'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const reason = searchParams.get('reason')
    if (reason === 'session-expired' || consumeSessionExpired()) {
      setError('Sesi Anda habis. Silakan login kembali untuk melanjutkan.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Email dan password wajib diisi')
      return
    }
    try {
      await login(email, password)
      const nextUser = useAuthStore.getState().user
      if (nextUser?.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/cms')
      }
    } catch (error) {
      setError(getPublicErrorMessage(error, 'Email atau password salah'))
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-terracotta/10 blur-[80px]" />
          <div className="absolute bottom-[15%] left-[10%] w-[200px] h-[200px] rounded-full bg-white/5 blur-[60px]" />
        </div>

        <div className="relative z-10 max-w-md">
          <Link to="/" className="inline-block mb-12">
            <BrandLogo theme="dark" showTagline />
          </Link>
          <h2 className="text-white text-3xl font-heading leading-tight mb-4">
            Selamat datang kembali
          </h2>
          <p className="text-white/50 text-lg leading-relaxed">
            Masuk ke dashboard untuk mengelola website, memantau statistik, dan memperbarui konten.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link to="/">
              <BrandLogo compact />
            </Link>
          </div>

          <h1 className="text-2xl font-heading text-foreground mb-2">Masuk</h1>
          <p className="text-muted-foreground mb-8">
            Masukkan kredensial untuk mengakses dashboard
          </p>

          {error && (
            <ErrorNotice message={error} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="label-text text-xs">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg"
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="label-text text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-lg pr-10"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-accent hover:bg-terracotta-hover text-white rounded-lg text-base group"
              id="login-submit"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-280" />}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Belum punya akun?{' '}
            <Link to="/daftar" className="text-accent hover:underline font-medium">
              Daftar sekarang
            </Link>
          </p>

          <p className="text-xs text-center text-muted-foreground/50 mt-8">
            Akses admin mengikuti role akun yang tersimpan di backend {BRAND.name}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
