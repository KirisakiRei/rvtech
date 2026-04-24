import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, BookOpen, Users, Award, Clock } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'

export function CmsEduGerbangAkademik() {
  const [form, setForm] = useState({
    curriculum: 'Kurikulum Merdeka',
    accreditation: 'A (Unggul)',
    studentCount: '560',
    teacherCount: '32',
    classCount: '18',
    operationalHours: 'Senin - Jumat, 07:00 - 14:00 WIB',
    extracurriculars: 'Pramuka, Seni Tari, Futsal, Paduan Suara, English Club, Robotik, PMR',
    achievements: '1. Juara 1 Cerdas Cermat Tingkat DKI Jakarta 2025\n2. Juara 2 Olimpiade Matematika Nasional 2025\n3. Juara 1 Lomba Kebersihan Sekolah Tingkat Kecamatan\n4. Sekolah Adiwiyata Mandiri 2024',
    programs: 'Program Literasi Pagi, Jumat Sehat, Kamis Berkebun, English Day (Rabu)',
  })

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const infoCards = [
    { icon: Users, label: 'Total Siswa', value: form.studentCount, color: 'bg-blue-500/10 text-blue-600' },
    { icon: BookOpen, label: 'Total Guru', value: form.teacherCount, color: 'bg-accent/10 text-accent' },
    { icon: Award, label: 'Prestasi', value: '4', color: 'bg-warning/10 text-warning' },
    { icon: Clock, label: 'Kelas', value: form.classCount, color: 'bg-success/10 text-success' },
  ]

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.edugerbang} title="Info Akademik" subtitle="Kelola data kurikulum, prestasi, dan program sekolah">
      <div className="max-w-3xl space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {infoCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}><card.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xl font-heading text-foreground">{card.value}</p>
                <p className="text-[11px] text-muted-foreground">{card.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Data Akademik</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acad-curriculum" className="label-text text-xs">Kurikulum</Label>
              <Input id="acad-curriculum" value={form.curriculum} onChange={(e) => update('curriculum', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acad-accreditation" className="label-text text-xs">Akreditasi</Label>
              <Input id="acad-accreditation" value={form.accreditation} onChange={(e) => update('accreditation', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acad-students" className="label-text text-xs">Jumlah Siswa</Label>
              <Input id="acad-students" value={form.studentCount} onChange={(e) => update('studentCount', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acad-teachers" className="label-text text-xs">Jumlah Guru</Label>
              <Input id="acad-teachers" value={form.teacherCount} onChange={(e) => update('teacherCount', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acad-classes" className="label-text text-xs">Jumlah Kelas</Label>
              <Input id="acad-classes" value={form.classCount} onChange={(e) => update('classCount', e.target.value)} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acad-hours" className="label-text text-xs">Jam Operasional</Label>
              <Input id="acad-hours" value={form.operationalHours} onChange={(e) => update('operationalHours', e.target.value)} className="h-10 rounded-lg" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Ekstrakurikuler</h3>
          <div className="space-y-2">
            <Label htmlFor="acad-extra" className="label-text text-xs">Daftar Ekstrakurikuler (pisahkan dengan koma)</Label>
            <Textarea id="acad-extra" value={form.extracurriculars} onChange={(e) => update('extracurriculars', e.target.value)} rows={2} className="rounded-lg" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Prestasi Sekolah</h3>
          <div className="space-y-2">
            <Label htmlFor="acad-achievements" className="label-text text-xs">Daftar Prestasi</Label>
            <Textarea id="acad-achievements" value={form.achievements} onChange={(e) => update('achievements', e.target.value)} rows={5} className="rounded-lg" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-medium text-foreground mb-5">Program Unggulan</h3>
          <div className="space-y-2">
            <Label htmlFor="acad-programs" className="label-text text-xs">Program</Label>
            <Textarea id="acad-programs" value={form.programs} onChange={(e) => update('programs', e.target.value)} rows={2} className="rounded-lg" />
          </div>
        </motion.div>

        <Button className="bg-accent hover:bg-terracotta-hover text-white rounded-xl h-11 px-6 gap-2" id="edu-save-akademik">
          <Save className="w-4 h-4" /> Simpan Data Akademik
        </Button>
      </div>
    </CmsLayout>
  )
}
