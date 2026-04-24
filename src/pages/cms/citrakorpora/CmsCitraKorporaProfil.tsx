import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Building2 } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'

export function CmsCitraKorporaProfil() {
  const [form, setForm] = useState({
    companyName: 'PT Maju Bersama',
    tagline: 'Building Tomorrow, Together',
    industry: 'Teknologi & Konsultan',
    founded: '2018',
    address: 'Gedung Graha Sudirman Lt. 15, Jl. Jend. Sudirman Kav. 45, Jakarta',
    phone: '021-55667788',
    email: 'info@majubersama.co.id',
    about: 'PT Maju Bersama adalah perusahaan teknologi dan konsultan yang telah berpengalaman lebih dari 7 tahun dalam menyediakan solusi digital inovatif. Dengan tim profesional yang berdedikasi, kami telah membantu lebih dari 200 klien dari berbagai industri untuk bertransformasi secara digital.',
    visi: 'Menjadi mitra utama transformasi digital terpercaya di Indonesia.',
    misi: '1. Memberikan solusi teknologi berkualitas tinggi\n2. Memberdayakan bisnis melalui inovasi digital\n3. Membangun hubungan jangka panjang dengan klien\n4. Mengembangkan talenta digital terbaik',
    services: 'Web Development, Mobile App, UI/UX Design, Cloud Infrastructure, Digital Marketing, Data Analytics',
  })

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.citrakorpora} title="Profil Perusahaan" subtitle="Kelola identitas dan informasi perusahaan">
      <div className="max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Logo & Branding</h3>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-navy flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <Button variant="outline" size="sm" className="mb-2" id="citra-upload-logo">Upload Logo</Button>
              <p className="text-xs text-muted-foreground">JPG, PNG, atau SVG. Maks. 2MB</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Informasi Perusahaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="citra-name" className="label-text text-xs">Nama Perusahaan</Label>
              <Input id="citra-name" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citra-tagline" className="label-text text-xs">Tagline</Label>
              <Input id="citra-tagline" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citra-industry" className="label-text text-xs">Industri</Label>
              <Input id="citra-industry" value={form.industry} onChange={(e) => update('industry', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citra-founded" className="label-text text-xs">Tahun Berdiri</Label>
              <Input id="citra-founded" value={form.founded} onChange={(e) => update('founded', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citra-phone" className="label-text text-xs">Telepon</Label>
              <Input id="citra-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citra-email" className="label-text text-xs">Email</Label>
              <Input id="citra-email" value={form.email} onChange={(e) => update('email', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="citra-address" className="label-text text-xs">Alamat</Label>
              <Input id="citra-address" value={form.address} onChange={(e) => update('address', e.target.value)} className="h-10 rounded-lg" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Tentang Perusahaan</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="citra-about" className="label-text text-xs">Deskripsi</Label>
              <Textarea id="citra-about" value={form.about} onChange={(e) => update('about', e.target.value)} rows={4} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citra-visi" className="label-text text-xs">Visi</Label>
              <Textarea id="citra-visi" value={form.visi} onChange={(e) => update('visi', e.target.value)} rows={2} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citra-misi" className="label-text text-xs">Misi</Label>
              <Textarea id="citra-misi" value={form.misi} onChange={(e) => update('misi', e.target.value)} rows={4} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citra-services" className="label-text text-xs">Layanan (pisahkan dengan koma)</Label>
              <Textarea id="citra-services" value={form.services} onChange={(e) => update('services', e.target.value)} rows={2} className="rounded-lg" />
            </div>
          </div>
        </motion.div>

        <Button className="bg-accent hover:bg-terracotta-hover text-white rounded-xl h-11 px-6 gap-2" id="citra-save-profil">
          <Save className="w-4 h-4" /> Simpan Profil
        </Button>
      </div>
    </CmsLayout>
  )
}
