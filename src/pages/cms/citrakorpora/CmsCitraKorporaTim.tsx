import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Upload } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'

const mockTeam = [
  { id: '1', name: 'Hendra Wijaya', role: 'CEO & Founder', photo: null },
  { id: '2', name: 'Sari Dewi', role: 'CTO', photo: null },
  { id: '3', name: 'Andi Prasetyo', role: 'Head of Design', photo: null },
  { id: '4', name: 'Rina Kusuma', role: 'Marketing Manager', photo: null },
  { id: '5', name: 'Dwi Santoso', role: 'Lead Developer', photo: null },
  { id: '6', name: 'Putri Ayu', role: 'HR Manager', photo: null },
]

export function CmsCitraKorporaTim() {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.citrakorpora} title="Kelola Tim" subtitle="Tampilkan profil anggota tim perusahaan">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{mockTeam.length} anggota tim</p>
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-accent hover:bg-terracotta-hover text-white gap-2" id="citra-add-member">
            <Plus className="w-4 h-4" /> Tambah Anggota
          </Button>
        </div>

        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Anggota Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member-name" className="label-text text-xs">Nama Lengkap</Label>
                <Input id="member-name" placeholder="Nama..." className="h-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-role" className="label-text text-xs">Jabatan</Label>
                <Input id="member-role" placeholder="CEO, CTO, dll..." className="h-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label className="label-text text-xs">Foto</Label>
                <Button variant="outline" className="w-full gap-2"><Upload className="w-4 h-4" /> Upload</Button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="bg-accent hover:bg-terracotta-hover text-white">Simpan</Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTeam.map((member, i) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl p-5 group hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-heading text-muted-foreground shrink-0">
                  {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive/50 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </CmsLayout>
  )
}
