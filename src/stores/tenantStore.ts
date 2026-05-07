import { create } from 'zustand'
import type { Tenant } from '@/types/tenant'
import { dataCreate, dataDetail, dataList } from '@/lib/api'
import { AppError, getPublicErrorMessage } from '@/lib/error'

type InvitationRow = {
  id: string
  user_id: string
  license_id: string
  template_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  status: 'draft' | 'published' | 'archived'
}

type InvitationSlugRow = {
  id: string
  invitation_id: string
  slug: string
  is_primary: boolean
}

type TemplateRow = {
  id: string
  category: string | null
  code: string
}

type LicenseRow = {
  id: string
  package_id: string
}

type PackageRow = {
  id: string
  code: string
}

interface TenantState {
  currentTenant: Tenant | null
  isLoading: boolean
  error: string | null
  hydrateForUser: (params: {
    userId: string
    ownerName: string
    ownerEmail: string
  }) => Promise<void>
  setCurrentTenant: (tenant: Tenant) => void
  clearTenant: () => void
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return base || 'undangan'
}

export const useTenantStore = create<TenantState>((set) => ({
  currentTenant: null,
  isLoading: false,
  error: null,
  hydrateForUser: async ({ userId, ownerName, ownerEmail }) => {
    set({ isLoading: true, error: null })

    try {
      const invitationRes = await dataList<InvitationRow>('invitations', {
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        limit: 1,
      })

      let invitation = invitationRes.data?.items?.[0] ?? null

      if (!invitation) {
        let templates = (await dataList<TemplateRow>('invitation-templates', { limit: 10 })).data?.items ?? []
        let packages = (await dataList<PackageRow>('packages', { limit: 10 })).data?.items ?? []

        if (templates.length === 0) {
          const createdTemplate = await dataCreate<TemplateRow>('invitation-templates', {
            code: `sapatamu-default-${Date.now()}`,
            name: 'SapaTamu Default',
            category: 'sapatamu',
            is_active: true,
          })
          if (createdTemplate.data) templates = [createdTemplate.data]
        }

        if (packages.length === 0) {
          const createdPackage = await dataCreate<PackageRow>('packages', {
            code: `pro-${Date.now()}`,
            name: 'Pro',
            price: 250000,
            currency: 'IDR',
            is_active: true,
          })
          if (createdPackage.data) packages = [createdPackage.data]
        }

        const selectedTemplate = templates[0]
        const selectedPackage = packages[0]

        if (!selectedTemplate || !selectedPackage) {
          throw new AppError('Template atau paket belum tersedia.')
        }

        const createdLicense = await dataCreate<LicenseRow>('user-template-licenses', {
          user_id: userId,
          template_id: selectedTemplate.id,
          package_id: selectedPackage.id,
          status: 'active',
        })

        if (!createdLicense.data) throw new AppError('Gagal membuat lisensi template.')

        const createdInvitation = await dataCreate<InvitationRow>('invitations', {
          user_id: userId,
          license_id: createdLicense.data.id,
          template_id: selectedTemplate.id,
          title: `Undangan ${ownerName}`,
          status: 'draft',
        })

        if (!createdInvitation.data) throw new AppError('Gagal membuat undangan baru.')

        const baseSlug = slugify(ownerName)
        await dataCreate<InvitationSlugRow>('invitation-slugs', {
          invitation_id: createdInvitation.data.id,
          slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
          is_primary: true,
          created_by: 'user',
        })

        await dataCreate('invitation-contents', {
          invitation_id: createdInvitation.data.id,
          version: 1,
          content_json: {
            selectedTheme: 'malay-ethnic-red-ruby',
            weddingData: {
              brideName: '',
              groomName: '',
              brideParents: '',
              groomParents: '',
              akadTime: '',
              akadLocation: '',
              resepsiTime: '',
              resepsiLocation: '',
              loveStory: '',
              bankAccountInfo: [],
            },
          },
          is_current: true,
        })

        invitation = createdInvitation.data
      }

      const [slugRes, templateRes, licenseRes] = await Promise.all([
        dataList<InvitationSlugRow>('invitation-slugs', {
          where: { invitation_id: invitation.id, is_primary: true },
          limit: 1,
        }),
        dataDetail<TemplateRow>('invitation-templates', invitation.template_id),
        dataDetail<LicenseRow>('user-template-licenses', invitation.license_id),
      ])

      const packageRes = licenseRes.data
        ? await dataDetail<PackageRow>('packages', licenseRes.data.package_id)
        : null

      const slug = slugRes.data?.items?.[0]?.slug ?? slugify(ownerName)
      const template = templateRes.data
      const packageCode = packageRes?.data?.code?.toLowerCase() ?? ''

      const mappedTenant: Tenant = {
        id: invitation.id,
        userId,
        domainUrl: slug,
        productCategory: template?.category === 'etalasepro' || template?.category === 'citrakorpora' || template?.category === 'edugerbang'
          ? template.category
          : 'sapatamu',
        tier: packageCode.includes('basic') ? 'basic' : 'pro',
        themeSettings: {
          primaryColor: '#8B5E3C',
          secondaryColor: '#F5E6D8',
          fontFamily: 'Playfair Display',
          heroStyle: 'fullscreen',
          templateId: template?.code ?? 'malay-ethnic-red-ruby',
        },
        status: invitation.status === 'archived' ? 'expired' : 'active',
        createdAt: invitation.created_at,
        expiresAt: new Date(new Date(invitation.created_at).setFullYear(new Date(invitation.created_at).getFullYear() + 1)).toISOString(),
        ownerName,
        ownerEmail,
      }

      set({ currentTenant: mappedTenant, isLoading: false, error: null })
    } catch (error) {
      set({
        currentTenant: null,
        isLoading: false,
        error: getPublicErrorMessage(error, 'Data undangan belum bisa dimuat saat ini.'),
      })
    }
  },
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
  clearTenant: () => set({ currentTenant: null, isLoading: false, error: null }),
}))
