import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, Copy, Check, MessageCircle, Plus, Trash2 } from 'lucide-react'
import { CmsLayout } from '@/components/layout/CmsLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BRAND, CMS_SIDEBAR_LINKS } from '@/lib/constants'
import { useTenantStore } from '@/stores/tenantStore'

interface GeneratedLink {
  name: string
  url: string
  waUrl: string
}

export function CmsSapatamuBroadcast() {
  const { currentTenant } = useTenantStore()
  const slug = currentTenant?.domainUrl || 'budi-siti'
  const baseUrl = `${BRAND.domain}/${slug}`

  const [singleName, setSingleName] = useState('')
  const [bulkNames, setBulkNames] = useState('')
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const generateLink = useCallback((name: string): GeneratedLink => {
    const encoded = encodeURIComponent(name.trim())
    const url = `${baseUrl}?to=${encoded}`
    const message = `Assalamu'alaikum ${name.trim()},\n\nDengan penuh kebahagiaan, kami mengundang Anda untuk hadir di acara pernikahan kami.\n\nBuka undangan di:\nhttps://${url}\n\nTerima kasih.`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    return { name: name.trim(), url: `https://${url}`, waUrl }
  }, [baseUrl])

  const handleSingleGenerate = () => {
    if (!singleName.trim()) return
    const link = generateLink(singleName)
    setGeneratedLinks((prev) => [link, ...prev])
    setSingleName('')
  }

  const handleBulkGenerate = () => {
    if (!bulkNames.trim()) return
    const names = bulkNames.split('\n').filter((n) => n.trim())
    const links = names.map(generateLink)
    setGeneratedLinks((prev) => [...links, ...prev])
    setBulkNames('')
  }

  const handleCopy = async (url: string, name: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(name)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRemove = (name: string) => {
    setGeneratedLinks((prev) => prev.filter((l) => l.name !== name))
  }

  return (
    <CmsLayout
      sidebarLinks={CMS_SIDEBAR_LINKS.sapatamu}
      title="Broadcast Generator"
      subtitle="Generate link unik dan kirim undangan via WhatsApp"
    >
      <div className="max-w-3xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-accent" />
              Kirim Satuan
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Nama tamu..."
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSingleGenerate()}
                className="h-10 rounded-lg"
                id="broadcast-single-input"
              />
              <Button
                onClick={handleSingleGenerate}
                disabled={!singleName.trim()}
                className="bg-accent hover:bg-terracotta-hover text-white shrink-0"
                id="broadcast-single-generate"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-base font-medium text-foreground mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent" />
              Kirim Massal
            </h3>
            <Textarea
              placeholder="Masukkan nama tamu (satu per baris)&#10;Contoh:&#10;Andi Wijaya&#10;Sari Dewi&#10;Riko Hadi"
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              rows={4}
              className="rounded-lg mb-3"
              id="broadcast-bulk-input"
            />
            <Button
              onClick={handleBulkGenerate}
              disabled={!bulkNames.trim()}
              className="w-full bg-accent hover:bg-terracotta-hover text-white"
              id="broadcast-bulk-generate"
            >
              Generate {bulkNames.split('\n').filter((n) => n.trim()).length} Link
            </Button>
          </motion.div>
        </div>

        {generatedLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-xl"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Link Tersedia ({generatedLinks.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive"
                onClick={() => setGeneratedLinks([])}
                id="broadcast-clear-all"
              >
                Hapus Semua
              </Button>
            </div>

            <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
              {generatedLinks.map((link, i) => (
                <motion.div
                  key={`${link.name}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{link.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleCopy(link.url, link.name)}
                        id={`broadcast-copy-${i}`}
                      >
                        {copiedId === link.name ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <a href={link.waUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-success hover:bg-success/10"
                          id={`broadcast-wa-${i}`}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(link.name)}
                        id={`broadcast-remove-${i}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </CmsLayout>
  )
}
