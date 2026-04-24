import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Briefcase, Trash2, Upload, ExternalLink } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'

const mockPortfolio = [
  { id: '1', title: 'E-Commerce Platform Redesign', client: 'TokoBagus', year: '2025', description: 'Redesain complete untuk platform e-commerce dengan fokus pada user experience.' },
  { id: '2', title: 'Mobile Banking App', client: 'Bank Digital', year: '2025', description: 'Pengembangan aplikasi mobile banking dengan fitur transfer dan pembayaran.' },
  { id: '3', title: 'Corporate Website', client: 'PT Energi Hijau', year: '2024', description: 'Website company profile untuk perusahaan energi terbarukan.' },
  { id: '4', title: 'Learning Management System', client: 'EduTech Indonesia', year: '2024', description: 'Platform e-learning dengan fitur video course dan quiz interaktif.' },
]

export function CmsCitraKorporaPortofolio() {
  const [isAdding, setIsAdding] = useState(false)

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.citrakorpora} title="Portofolio" subtitle="Showcase proyek dan klien perusahaan">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{mockPortfolio.length} proyek</p>
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-accent hover:bg-terracotta-hover text-white gap-2" id="citra-add-portfolio">
            <Plus className="w-4 h-4" /> Tambah Proyek
          </Button>
        </div>

        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Proyek Baru</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port-title" className="label-text text-xs">Nama Proyek</Label>
                  <Input id="port-title" placeholder="Nama proyek..." className="h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port-client" className="label-text text-xs">Klien</Label>
                  <Input id="port-client" placeholder="Nama klien..." className="h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port-year" className="label-text text-xs">Tahun</Label>
                  <Input id="port-year" placeholder="2025" className="h-10 rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="port-desc" className="label-text text-xs">Deskripsi</Label>
                <Textarea id="port-desc" placeholder="Deskripsi proyek..." rows={3} className="rounded-lg" />
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Upload gambar proyek</p>
              </div>
              <div className="flex gap-2">
                <Button className="bg-accent hover:bg-terracotta-hover text-white">Simpan</Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockPortfolio.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 hover:shadow-md">
              <div className="aspect-[16/9] bg-muted relative flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-muted-foreground/20" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="secondary" size="icon" className="w-7 h-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
                  <Button variant="secondary" size="icon" className="w-7 h-7 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-foreground">{project.title}</h4>
                  <span className="text-[10px] text-muted-foreground">{project.year}</span>
                </div>
                <p className="text-xs text-accent font-medium mb-2">{project.client}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </CmsLayout>
  )
}
