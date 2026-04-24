import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Package, MoreHorizontal, Edit, Trash2, Eye, EyeOff, Tag } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CMS_SIDEBAR_LINKS, formatRupiah } from '@/lib/constants'

const mockProducts = [
  { id: '1', name: 'Artisanal Choco Cookies', price: 85000, stock: 'available', category: 'Kue', badge: 'Bestseller', image: '/images/product-3.png' },
  { id: '2', name: 'Premium Strawberry Jam', price: 120000, stock: 'available', category: 'Makanan', badge: 'New', image: '/images/product-1.png' },
  { id: '3', name: 'Roasted Coffee Beans', price: 135000, stock: 'available', category: 'Minuman', badge: null, image: '/images/product-2.png' },
  { id: '4', name: 'Keripik Tempe Pedas', price: 25000, stock: 'available', category: 'Snack', badge: null, image: null },
  { id: '5', name: 'Dodol Garut Original', price: 45000, stock: 'out', category: 'Kue', badge: 'Sale', image: null },
  { id: '6', name: 'Abon Ikan Tuna', price: 55000, stock: 'available', category: 'Makanan', badge: null, image: null },
  { id: '7', name: 'Kerupuk Udang Premium', price: 40000, stock: 'available', category: 'Snack', badge: null, image: null },
  { id: '8', name: 'Manisan Mangga', price: 30000, stock: 'out', category: 'Snack', badge: null, image: null },
]

const badgeColors: Record<string, string> = {
  'Bestseller': 'bg-accent/10 text-accent',
  'New': 'bg-success/10 text-success',
  'Sale': 'bg-destructive/10 text-destructive',
}

export function CmsEtalaseProProduk() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = [...new Set(mockProducts.map((p) => p.category))]
  const filtered = mockProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter
    return matchSearch && matchCategory
  })

  return (
    <CmsLayout sidebarLinks={CMS_SIDEBAR_LINKS.etalasepro} title="Kelola Produk" subtitle={`${mockProducts.length} produk terdaftar`}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 rounded-lg" id="etalase-product-search" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground" id="etalase-category-filter">
              <option value="all">Semua Kategori</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button className="bg-success hover:bg-success/90 text-white gap-2" id="etalase-add-product">
            <Plus className="w-4 h-4" /> Tambah Produk
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="aspect-square bg-muted relative flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-t-xl" />
                ) : (
                  <Package className="w-8 h-8 text-muted-foreground/30" />
                )}
                {product.badge && (
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold ${badgeColors[product.badge] || 'bg-muted text-foreground'}`}>
                    {product.badge}
                  </div>
                )}
                {product.stock === 'out' && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <span className="text-xs font-medium text-destructive bg-destructive/10 px-3 py-1 rounded-full">Stok Habis</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="w-7 h-7"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2"><Edit className="w-4 h-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">{product.stock === 'out' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} {product.stock === 'out' ? 'Aktifkan' : 'Nonaktifkan'}</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{product.category}</span>
                </div>
                <h4 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h4>
                <p className="text-base font-heading text-foreground mt-1">{formatRupiah(product.price)}</p>
              </div>
            </motion.div>
          ))}

          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: filtered.length * 0.05 }}
            className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center py-12 text-muted-foreground hover:text-accent hover:border-accent transition-colors" id="etalase-add-product-card">
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Tambah Produk</span>
          </motion.button>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada produk yang cocok</p>
          </div>
        )}
      </div>
    </CmsLayout>
  )
}
