import { useEffect, useMemo, useRef, useState } from 'react'
import { PencilLine, CheckCircle2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TokenDefinition = {
  token: string
  label: string
  value?: string
}

type PrefaceComposerProps = {
  template: string
  tokens: TokenDefinition[]
  onAutosave: (value: string) => Promise<void>
  className?: string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function PrefaceComposer({
  template,
  tokens,
  onAutosave,
  className,
}: PrefaceComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(template)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [editorHeight, setEditorHeight] = useState(260)
  const tokenMap = useMemo(() => new Map(tokens.map((item) => [item.token, item])), [tokens])

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(template)
    }
  }, [template, isEditing])

  useEffect(() => {
    if (!isEditing) return

    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = '0px'
    const nextHeight = Math.max(260, textarea.scrollHeight)
    textarea.style.height = `${nextHeight}px`
    setEditorHeight(nextHeight)
  }, [draftValue, isEditing])

  useEffect(() => {
    if (!isEditing) return
    if (draftValue === template) return

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
    }

    setSaveState('idle')

    saveTimerRef.current = window.setTimeout(() => {
      setSaveState('saving')

      void onAutosave(draftValue)
        .then(() => {
          setSaveState('saved')
        })
        .catch(() => {
          setSaveState('error')
        })
    }, 900)

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [draftValue, isEditing, onAutosave, template])

  const statusLabel = useMemo(() => {
    if (saveState === 'saving') {
      return {
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
        text: 'Menyimpan...',
        className: 'text-muted-foreground',
      }
    }

    if (saveState === 'saved') {
      return {
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        text: 'Tersimpan otomatis',
        className: 'text-accent',
      }
    }

    if (saveState === 'error') {
      return {
        icon: <PencilLine className="h-3.5 w-3.5" />,
        text: 'Belum tersimpan',
        className: 'text-destructive',
      }
    }

    return {
      icon: <PencilLine className="h-3.5 w-3.5" />,
      text: 'Autosave aktif',
      className: 'text-muted-foreground',
    }
  }, [saveState])

  const renderHighlighted = (value: string, mode: 'preview' | 'edit') => {
    return value
      .split(/(\{\{[^}]+\}\})/g)
      .filter(Boolean)
      .map((part, index) => {
        const match = part.match(/^\{\{([^}]+)\}\}$/)
        if (!match) {
          return <span key={`text-${index}`}>{part}</span>
        }

        const token = match[1]
        const tokenDefinition = tokenMap.get(token)

        return (
          <span
            key={`token-${token}-${index}`}
            className={cn(
              'font-medium',
              mode === 'preview' ? 'text-accent' : 'text-sky-600',
            )}
          >
            {mode === 'preview'
              ? tokenDefinition?.value || tokenDefinition?.label || part
              : part}
          </span>
        )
      })
  }

  const insertTokenAtCursor = (token: string) => {
    const textarea = textareaRef.current
    const tokenText = `{{${token}}}`

    if (!textarea) {
      setDraftValue((current) => `${current}${current.endsWith('\n') || !current ? '' : '\n'}${tokenText}`)
      return
    }

    const start = textarea.selectionStart ?? draftValue.length
    const end = textarea.selectionEnd ?? draftValue.length
    const nextValue = `${draftValue.slice(0, start)}${tokenText}${draftValue.slice(end)}`
    const nextCursor = start + tokenText.length

    setDraftValue(nextValue)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const openEditor = () => {
    setIsEditing(true)
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.style.height = '0px'
      const nextHeight = Math.max(260, textarea.scrollHeight)
      textarea.style.height = `${nextHeight}px`
      setEditorHeight(nextHeight)
    })
  }

  const closeEditor = async () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    if (draftValue !== template) {
      setSaveState('saving')
      try {
        await onAutosave(draftValue)
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }

    setIsEditing(false)
  }

  return (
    <div className={cn('rounded-[1.6rem] border border-border bg-card p-5 lg:p-6', className)}>
      {!isEditing ? (
        <button
          type="button"
          onClick={openEditor}
          className="group block w-full text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-foreground">Preface</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hover lalu klik card ini untuk mengedit template. Tampilan normal menunjukkan hasil final yang akan diterima tamu.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:bg-accent/10 group-hover:text-accent">
              <PencilLine className="mr-1.5 h-3.5 w-3.5" />
              Klik untuk edit
            </div>
          </div>

          <div className="mt-5 rounded-[1.4rem] bg-muted/25 p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
              {renderHighlighted(template, 'preview')}
            </p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-foreground">Edit Preface</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit template di bawah ini. Variabel akan otomatis diganti ke nilai aslinya saat tampil normal.
              </p>
            </div>
            <div className={cn('inline-flex items-center gap-1.5 text-xs font-medium', statusLabel.className)}>
              {statusLabel.icon}
              <span>{statusLabel.text}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Edit Template
            </p>
            <div
              className="relative overflow-hidden rounded-[1.4rem] border border-border bg-background"
              style={{ minHeight: editorHeight, height: editorHeight }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 whitespace-pre-wrap px-4 py-3 text-sm leading-7 text-foreground"
              >
                {draftValue
                  ? renderHighlighted(draftValue, 'edit')
                  : <span className="text-muted-foreground">Tulis kalimat pengantar undangan di sini.</span>}
              </div>
              <textarea
                ref={textareaRef}
                value={draftValue}
                onChange={(event) => setDraftValue(event.target.value)}
                rows={12}
                className="relative z-10 w-full resize-none overflow-hidden bg-transparent px-4 py-3 text-sm leading-7 text-transparent caret-foreground outline-none selection:bg-accent/20"
                placeholder="Tulis kalimat pengantar undangan di sini."
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sisipkan Variabel</p>
            <div className="flex flex-wrap gap-2">
              {tokens.map((item) => (
                <button
                  key={item.token}
                  type="button"
                  onClick={() => insertTokenAtCursor(item.token)}
                >
                  <Badge className="border-0 bg-muted text-foreground hover:bg-muted/80">
                    {item.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => void closeEditor()}>
              Tutup Editor
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
