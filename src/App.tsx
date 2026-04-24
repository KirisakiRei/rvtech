import { type ReactElement, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ProductSapaTamu } from '@/pages/ProductSapaTamu'
import { ProductEtalasePro } from '@/pages/ProductEtalasePro'
import { ProductCitraKorpora } from '@/pages/ProductCitraKorpora'
import { ProductEduGerbang } from '@/pages/ProductEduGerbang'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminTenants } from '@/pages/admin/AdminTenants'
import { CmsDashboard } from '@/pages/cms/CmsDashboard'
import { CmsProfil } from '@/pages/cms/CmsProfil'
import { CmsLangganan } from '@/pages/cms/CmsLangganan'
import { CmsPaymentStatus } from '@/pages/cms/CmsPaymentStatus'
import { CmsSapatamuEditor } from '@/pages/cms/sapatamu/CmsSapatamuEditor'
import { CmsSapatamuActivate } from '@/pages/cms/sapatamu/CmsSapatamuActivate'
import { CmsSapatamuCart } from '@/pages/cms/sapatamu/CmsSapatamuCart'
import { CmsSapatamuCheckout } from '@/pages/cms/sapatamu/CmsSapatamuCheckout'
import { CmsSapatamuWorkspace } from '@/pages/cms/sapatamu/CmsSapatamuWorkspace'
import { CmsEtalaseProDashboard } from '@/pages/cms/etalasepro/CmsEtalaseProDashboard'
import { CmsEtalaseProProduk } from '@/pages/cms/etalasepro/CmsEtalaseProProduk'
import { CmsCitraKorporaDashboard } from '@/pages/cms/citrakorpora/CmsCitraKorporaDashboard'
import { CmsCitraKorporaProfil } from '@/pages/cms/citrakorpora/CmsCitraKorporaProfil'
import { CmsCitraKorporaTim } from '@/pages/cms/citrakorpora/CmsCitraKorporaTim'
import { CmsCitraKorporaPortofolio } from '@/pages/cms/citrakorpora/CmsCitraKorporaPortofolio'
import { CmsEduGerbangDashboard } from '@/pages/cms/edugerbang/CmsEduGerbangDashboard'
import { CmsEduGerbangProfil } from '@/pages/cms/edugerbang/CmsEduGerbangProfil'
import { CmsEduGerbangPengumuman } from '@/pages/cms/edugerbang/CmsEduGerbangPengumuman'
import { CmsEduGerbangGaleri } from '@/pages/cms/edugerbang/CmsEduGerbangGaleri'
import { CmsEduGerbangAkademik } from '@/pages/cms/edugerbang/CmsEduGerbangAkademik'
import { TenantWeddingPage } from '@/pages/tenant/TenantWeddingPage'
import { DemoSunny } from '@/pages/DemoSunny'

type AuthGateProps = {
  children: ReactElement
  roles?: Array<'ADMIN' | 'CLIENT'>
}

function RequireAuth({ children, roles }: AuthGateProps) {
  const { initialized, isAuthenticated, user } = useAuthStore()

  if (!initialized) {
    return <div className="min-h-screen bg-background" />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/masuk" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/cms'} replace />
  }

  return children
}

function RequireGuest({ children }: { children: ReactElement }) {
  const { initialized, isAuthenticated, user } = useAuthStore()

  if (!initialized) {
    return <div className="min-h-screen bg-background" />
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/cms'} replace />
  }

  return children
}

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    void initializeAuth()
  }, [initializeAuth])

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/masuk"
            element={
              <RequireGuest>
                <LoginPage />
              </RequireGuest>
            }
          />
          <Route
            path="/daftar"
            element={
              <RequireGuest>
                <RegisterPage />
              </RequireGuest>
            }
          />

          <Route path="/produk/sapatamu" element={<ProductSapaTamu />} />
          <Route path="/produk/etalasepro" element={<ProductEtalasePro />} />
          <Route path="/produk/citrakorpora" element={<ProductCitraKorpora />} />
          <Route path="/produk/edugerbang" element={<ProductEduGerbang />} />

          <Route
            path="/admin"
            element={
              <RequireAuth roles={['ADMIN']}>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/tenants"
            element={
              <RequireAuth roles={['ADMIN']}>
                <AdminTenants />
              </RequireAuth>
            }
          />

          <Route
            path="/cms"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/create/sapatamu"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/profil"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsProfil />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/langganan"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsLangganan />
              </RequireAuth>
            }
          />

          <Route
            path="/cms/sapatamu/:invitationId"
            element={<Navigate to="send" replace />}
          />
          <Route
            path="/cms/sapatamu/:invitationId/editor"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsSapatamuEditor />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/sapatamu/:invitationId/activate"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsSapatamuActivate />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/sapatamu/:invitationId/cart"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsSapatamuCart />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/sapatamu/:invitationId/checkout"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsSapatamuCheckout />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/sapatamu/:invitationId/:tab"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsSapatamuWorkspace />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/payments/:orderId"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsPaymentStatus />
              </RequireAuth>
            }
          />

          <Route
            path="/cms/etalasepro"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsEtalaseProDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/etalasepro/produk"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsEtalaseProProduk />
              </RequireAuth>
            }
          />

          <Route
            path="/cms/citrakorpora"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsCitraKorporaDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/citrakorpora/profil"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsCitraKorporaProfil />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/citrakorpora/tim"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsCitraKorporaTim />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/citrakorpora/portofolio"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsCitraKorporaPortofolio />
              </RequireAuth>
            }
          />

          <Route
            path="/cms/edugerbang"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsEduGerbangDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/edugerbang/profil"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsEduGerbangProfil />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/edugerbang/pengumuman"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsEduGerbangPengumuman />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/edugerbang/galeri"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsEduGerbangGaleri />
              </RequireAuth>
            }
          />
          <Route
            path="/cms/edugerbang/akademik"
            element={
              <RequireAuth roles={['CLIENT']}>
                <CmsEduGerbangAkademik />
              </RequireAuth>
            }
          />

          <Route path="/demo-sunny" element={<DemoSunny />} />
          <Route path="/:slug" element={<TenantWeddingPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
