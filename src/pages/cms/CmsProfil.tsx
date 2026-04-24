import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Upload, Mail, Phone, MapPin } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'
import { useAuthStore } from '@/stores/authStore'

export function CmsProfil() {
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    name: user?.name || 'Budi Santoso',
    email: user?.email || 'budi@email.com',
    phone: '0812-3456-7890',
    address: 'Jakarta Selatan',
    bio: 'Wedding planner & digital invitation enthusiast. Helping couples create memorable moments.',
  })

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.general} title="Profil Saya" subtitle="Kelola informasi akun">
      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Foto Profil</h3>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-2xl font-heading text-accent">
              {form.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <Button variant="outline" size="sm" className="mb-2 gap-2" id="profile-upload-photo">
                <Upload className="w-4 h-4" /> Upload Foto
              </Button>
              <p className="text-xs text-muted-foreground">JPG atau PNG. Maks. 2MB</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Informasi Personal</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="label-text text-xs">Nama Lengkap</Label>
              <Input id="profile-name" value={form.name} onChange={(e) => update('name', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email" className="label-text text-xs flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email
              </Label>
              <Input id="profile-email" value={form.email} onChange={(e) => update('email', e.target.value)} className="h-10 rounded-lg" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone" className="label-text text-xs flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Telepon
              </Label>
              <Input id="profile-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-address" className="label-text text-xs flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Lokasi
              </Label>
              <Input id="profile-address" value={form.address} onChange={(e) => update('address', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-bio" className="label-text text-xs">Bio</Label>
              <Textarea id="profile-bio" value={form.bio} onChange={(e) => update('bio', e.target.value)} rows={3} className="rounded-lg" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Keamanan</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-current-pw" className="label-text text-xs">Password Saat Ini</Label>
              <Input id="profile-current-pw" type="password" placeholder="••••••••" className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-new-pw" className="label-text text-xs">Password Baru</Label>
              <Input id="profile-new-pw" type="password" placeholder="Minimal 8 karakter..." className="h-10 rounded-lg" />
            </div>
          </div>
        </motion.div>

        <Button className="bg-accent hover:bg-terracotta-hover text-white rounded-xl h-11 px-6 gap-2" id="profile-save">
          <Save className="w-4 h-4" /> Simpan Profil
        </Button>
      </div>
    </CmsLayout>
  )
}
