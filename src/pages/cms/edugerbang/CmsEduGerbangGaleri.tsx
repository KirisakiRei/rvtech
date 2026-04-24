import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Image, Trash2, Upload } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CMS_SIDEBAR_LINKS } from '@/lib/constants'

const mockAlbums = [
  {
    id: '1',
    title: 'Upacara Bendera 17 Agustus 2025',
    date: '2025-08-17',
    photoCount: 12,
  },
  {
    id: '2',
    title: 'Field Trip — Kebun Raya Bogor',
    date: '2025-10-03',
    photoCount: 24,
  },
  {
    id: '3',
    title: 'Lomba Cerdas Cermat Tingkat Kecamatan',
    date: '2025-11-15',
    photoCount: 8,
  },
  {
    id: '4',
    title: 'Pentas Seni Akhir Tahun',
    date: '2025-12-20',
    photoCount: 32,
  },
]

export function CmsEduGerbangGaleri() {
  const [isAdding, setIsAdding] = useState(false)
  const [newAlbumTitle, setNewAlbumTitle] = useState('')

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.edugerbang} title="Galeri Kegiatan" subtitle="Dokumentasi kegiatan sekolah dalam foto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{mockAlbums.length} album • {mockAlbums.reduce((a, b) => a + b.photoCount, 0)} foto</p>
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-accent hover:bg-terracotta-hover text-white gap-2" id="edu-gallery-add-album">
            <Plus className="w-4 h-4" /> Album Baru
          </Button>
        </div>

        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-medium text-foreground mb-4">Album Baru</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="album-title" className="label-text text-xs">Judul Album</Label>
                <Input id="album-title" value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} placeholder="Contoh: Kunjungan Museum Nasional" className="h-10 rounded-lg" />
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Drop foto di sini atau klik untuk upload</p>
                <p className="text-xs text-muted-foreground/60">JPG, PNG. Maks. 5MB per foto</p>
              </div>
              <div className="flex gap-2">
                <Button className="bg-accent hover:bg-terracotta-hover text-white">Buat Album</Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAlbums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-md"
            >
              <div className="aspect-video bg-muted relative flex items-center justify-center">
                <div className="grid grid-cols-2 gap-1 p-3 w-full h-full">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-muted-foreground/10 rounded" />
                  ))}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Image className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-sm font-medium text-foreground line-clamp-1">{album.title}</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(album.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {album.photoCount} foto
                  </p>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive/50 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </CmsLayout>
  )
}
