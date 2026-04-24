import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  theme?: 'light' | 'dark'
  showTagline?: boolean
  compact?: boolean
  variant?: 'full' | 'icon'
}

export function BrandLogo({
  className,
  theme = 'light',
  compact = false,
  variant = 'full',
}: BrandLogoProps) {
  const logoSrc = variant === 'icon'
    ? theme === 'dark'
      ? '/icon-darkmode.png'
      : '/icon.png'
    : theme === 'dark'
      ? '/brand-logo-darkmode.png'
      : '/brand-logo.png'

  return (
    <div className={cn('inline-flex items-center', className)}>
      <img
        src={logoSrc}
        alt={`${BRAND.name} logo`}
        className={cn(
          'block w-auto object-contain',
          variant === 'icon'
            ? compact
              ? 'h-8 w-8'
              : 'h-10 w-10'
            : compact
              ? 'h-8 lg:h-9'
              : 'h-10 lg:h-14',
        )}
      />
    </div>
  )
}
