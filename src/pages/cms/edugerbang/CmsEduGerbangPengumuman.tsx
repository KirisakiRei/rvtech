import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Megaphone, Calendar, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'

const mockAnnouncements = [
  { id: '1', title: 'Libur Hari Raya Idul Fitri 2026', content: 'Diberitahukan kepada seluruh warga sekolah bahwa libur Hari Raya Idul Fitri dimulai dari...', date: '2026-03-20', status: 'published' },
  { id: '2', title: 'Pendaftaran Siswa Baru TA 2026/2027', content: 'Pendaftaran siswa baru tahun ajaran 2026/2027 telah dibuka. Silakan mengisi formulir...', date: '2026-03-15', status: 'published' },
  { id: '3', title: 'Jadwal UTS Semester Genap', content: 'Ujian Tengah Semester Genap akan dilaksanakan pada tanggal 7-12 April 2026. Silakan...', date: '2026-03-10', status: 'published' },
  { id: '4', title: 'Kegiatan Class Meeting', content: 'Class meeting akan diadakan pada tanggal 2-4 April 2026 dengan berbagai lomba menarik...', date: '2026-03-05', status: 'draft' },
  { id: '5', title: 'Penggunaan Seragam Batik', content: 'Mulai semester ini, seragam batik dikenakan setiap hari Kamis. Info lengkap...', date: '2026-02-28', status: 'published' },
]

export function CmsEduGerbangPengumuman() {
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const filtered = mockAnnouncements.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.edugerbang} title="Pengumuman" subtitle="Kelola pengumuman sekolah">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari pengumuman..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-lg" id="edu-pengumuman-search" />
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-accent hover:bg-terracotta-hover text-white gap-2" id="edu-pengumuman-add">
            <Plus className="w-4 h-4" /> Tambah Pengumuman
          </Button>
        </div>

        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Pengumuman Baru</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edu-new-title" className="label-text text-xs">Judul</Label>
                <Input id="edu-new-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Judul pengumuman..." className="h-10 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edu-new-content" className="label-text text-xs">Isi Pengumuman</Label>
                <Textarea id="edu-new-content" value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Tulis isi pengumuman..." rows={4} className="rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Button className="bg-accent hover:bg-terracotta-hover text-white" id="edu-publish-new">Publikasikan</Button>
                <Button variant="outline" id="edu-draft-new">Simpan Draft</Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)} id="edu-cancel-new">Batal</Button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-xl">
          <div className="divide-y divide-border/50">
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="p-4 lg:p-5 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Megaphone className="w-4 h-4 text-warning shrink-0" />
                      <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                      <Badge className={item.status === 'published' ? 'bg-success/10 text-success border-0 text-[10px]' : 'bg-muted text-muted-foreground border-0 text-[10px]'}>
                        {item.status === 'published' ? 'Publik' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.content}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> Lihat</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Belum ada pengumuman</p>
            </div>
          )}
        </motion.div>
      </div>
    </CmsLayout>
  )
}
