'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/dashboard/Header'
import LeftSidebar from '@/components/dashboard/LeftSidebar'
import Footer from '@/components/dashboard/MainContent/Footer'
import RightSidebar from '@/components/dashboard/RightSidebar'
import ClientWrapper from '@/components/widgets/ClientWrapper'
import { AuthProvider } from '@/context/AuthContext'
import MobileBottomNav from '@/components/dashboard/mobileDesign/MobileBottomNav'
import { useAuth } from '@/hooks/useAuth'
import { fetchUserInfoAPI } from '../api/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [rightOpen, setRightOpen] = useState(false)
  const { user } = useAuth();

  // get login user info from api and update localStorage 
  useEffect(() => {
    if (!user) return;

    const fetchUserInfo = async () => {
      try {
        const res = await fetchUserInfoAPI();

        if (res?.data) {          
          // Save fresh user info
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(res.data));
          }
          
        } else {
          console.warn("User info response is empty");
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, [user]);  

  return (
    <AuthProvider>
      <div className="page-wrapper a-cursor">
        <button
          type="button"
          className={`right-sidebar-btn ${rightOpen ? 'active' : ''}`}
          onClick={() => setRightOpen(v => !v)}
          aria-expanded={rightOpen}
          aria-controls="right-sidebar"
        >
          <i className="fa-solid fa-circle-info"></i>
        </button>

        <Header />

        <div className="affiliate-wrapper page-wrapper a-cursor mt-60">
          <div className="dash-layout-wrapper p-md-4">
            <LeftSidebar />
            {/* content-area  */}
            <main className="mx-auto page-wrapper a-cursor flex-grow-1 w-100 px-2 px-md-0">{children}</main>

            <RightSidebar open={rightOpen} />
          </div>

          <div>
            <Footer />
          </div>
        </div>

        <MobileBottomNav />

        <ClientWrapper /> 
      </div>
    </AuthProvider>
  )
}