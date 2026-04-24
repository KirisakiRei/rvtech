import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Upload } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { BRAND, CMS_SIDEBAR_LINKS } from '@/lib/constants'

export function CmsEduGerbangProfil() {
  const [form, setForm] = useState({
    schoolName: 'SDN Ceria 1',
    npsn: '20123456',
    address: 'Jl. Pendidikan No. 45, Kota Jakarta Selatan',
    phone: '021-12345678',
    email: 'info@sdnceria1.sch.id',
    website: `sdn-ceria-1.${BRAND.domain}`,
    principal: 'Dra. Hj. Siti Nurhaliza, M.Pd.',
    foundedYear: '1985',
    accreditation: 'A',
    visi: 'Mewujudkan generasi cerdas, berkarakter, dan berdaya saing global.',
    misi: '1. Menyelenggarakan pendidikan yang berkualitas\n2. Mengembangkan potensi siswa secara optimal\n3. Membangun karakter yang berakhlak mulia\n4. Menciptakan lingkungan belajar yang kondusif',
    description: 'SDN Ceria 1 adalah sekolah dasar negeri unggulan yang telah berdiri sejak 1985. Dengan komitmen pada pendidikan berkualitas, kami telah meluluskan ribuan alumni yang berkontribusi bagi masyarakat.',
  })

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.edugerbang} title="Profil Sekolah" subtitle="Kelola informasi dan identitas sekolah">
      <div className="max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Logo & Header</h3>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <Button variant="outline" size="sm" className="mb-2" id="edu-upload-logo">Upload Logo</Button>
              <p className="text-xs text-muted-foreground">JPG, PNG, atau SVG. Maks. 2MB</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Identitas Sekolah</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edu-name" className="label-text text-xs">Nama Sekolah</Label>
              <Input id="edu-name" value={form.schoolName} onChange={(e) => update('schoolName', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-npsn" className="label-text text-xs">NPSN</Label>
              <Input id="edu-npsn" value={form.npsn} onChange={(e) => update('npsn', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-principal" className="label-text text-xs">Kepala Sekolah</Label>
              <Input id="edu-principal" value={form.principal} onChange={(e) => update('principal', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-founded" className="label-text text-xs">Tahun Berdiri</Label>
              <Input id="edu-founded" value={form.foundedYear} onChange={(e) => update('foundedYear', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-accreditation" className="label-text text-xs">Akreditasi</Label>
              <Input id="edu-accreditation" value={form.accreditation} onChange={(e) => update('accreditation', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-phone" className="label-text text-xs">Telepon</Label>
              <Input id="edu-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="edu-address" className="label-text text-xs">Alamat</Label>
              <Input id="edu-address" value={form.address} onChange={(e) => update('address', e.target.value)} className="h-10 rounded-lg" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Visi & Misi</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edu-visi" className="label-text text-xs">Visi</Label>
              <Textarea id="edu-visi" value={form.visi} onChange={(e) => update('visi', e.target.value)} rows={2} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edu-misi" className="label-text text-xs">Misi</Label>
              <Textarea id="edu-misi" value={form.misi} onChange={(e) => update('misi', e.target.value)} rows={4} className="rounded-lg" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Deskripsi Sekolah</h3>
          <div className="space-y-2">
            <Label htmlFor="edu-desc" className="label-text text-xs">Deskripsi</Label>
            <Textarea id="edu-desc" value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className="rounded-lg" />
          </div>
        </motion.div>

        <Button className="bg-accent hover:bg-terracotta-hover text-white rounded-xl h-11 px-6 gap-2" id="edu-save-profil">
          <Save className="w-4 h-4" /> Simpan Profil
        </Button>
      </div>
    </CmsLayout>
  )
}
