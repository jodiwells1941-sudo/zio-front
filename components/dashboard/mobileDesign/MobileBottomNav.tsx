'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

const navItems = [
  {
    label: 'Home',
    href: '/dashboard/',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    label: 'Tickets',
    href: '/dashboard/ticket-history',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V7zm4 0v10h2V7H7zm6 0v10h2V7h-2z"/>
      </svg>
    ),
  },
  {
    label: 'Lottery',
    href: '/dashboard/lottery',
    icon: (
      <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
        {/* Ferris wheel icon */}
        <circle cx="24" cy="22" r="13" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="24" cy="22" r="3" fill="currentColor"/>
        {/* spokes */}
        <line x1="24" y1="9" x2="24" y2="19" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="24" y1="25" x2="24" y2="35" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="11" y1="22" x2="21" y2="22" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="27" y1="22" x2="37" y2="22" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="15.1" y1="13.1" x2="21.9" y2="19.9" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="26.1" y1="24.1" x2="32.9" y2="30.9" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="32.9" y1="13.1" x2="26.1" y2="19.9" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="21.9" y1="24.1" x2="15.1" y2="30.9" stroke="currentColor" strokeWidth="1.5"/>
        {/* gondolas */}
        <circle cx="24" cy="9" r="2.5" fill="currentColor" opacity="0.8"/>
        <circle cx="37" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
        <circle cx="24" cy="35" r="2.5" fill="currentColor" opacity="0.8"/>
        <circle cx="11" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
        {/* base */}
        <line x1="17" y1="35" x2="12" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="31" y1="35" x2="36" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="44" x2="38" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Winner',
    href: '/dashboard/lottery-winner',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
  {
    label: 'More',
    href: '/dashboard/more',
    icon: (
      <svg width="24" height="18" viewBox="0 0 22 16" fill="currentColor">
        <rect y="0"  width="22" height="2.5" rx="1.25"/>
        <rect y="6.75"  width="22" height="2.5" rx="1.25"/>
        <rect y="13.5" width="22" height="2.5" rx="1.25"/>
      </svg>
    ),
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  // Hide on wallet page
  if (pathname.startsWith('/dashboard/wallet')) return null
  if (pathname.startsWith('/dashboard/chat')) return null
  if (pathname.startsWith('/dashboard/p2p-profile')) return null
  if (pathname.startsWith('/dashboard/ads')) return null
  if (pathname.startsWith('/dashboard/orders')) return null

  const toggleLeftSidebar = useCallback(() => {
    document.querySelector(".left-sidebar-area")?.classList.toggle("active");
  }, []);

  return (
    <>
      <nav className="mobile-bottom-nav d-flex d-md-none">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          // if (item.href == pathname) {
          //   return (
          //     <Link key={item.label} href={item.href} className="mobile-bottom-nav__center-wrap">
          //       <div className={`mobile-bottom-nav__center-btn ${isActive ? 'center-active' : ''}`}>
          //         {item.icon}
          //       </div>
          //     </Link>
          //   )
          // }
          //  onClick={toggleLeftSidebar}

          if (item.label == 'More') {
            return(
              <>
                <button key={index+1} onClick={toggleLeftSidebar}
                    className={`mobile-bottom-nav__item ${isActive ? 'nav-item-active' : ''}`}
                  >
                    <span className="mobile-bottom-nav__icon">{item.icon}</span>
                    <span className="mobile-bottom-nav__label">{item.label}</span>
                  </button>
              </>
            )
          }

          return (
            <>
              { isActive ?
                <Link key={index+1} href={item.href} className="mobile-bottom-nav__center-wrap">
                  <div className={`mobile-bottom-nav__center-btn ${isActive ? 'center-active' : ''}`}>
                    {item.icon}
                  </div>
                </Link>
                :
                <Link
                  key={index+1}
                  href={item.href}
                  className={`mobile-bottom-nav__item ${isActive ? 'nav-item-active' : ''}`}
                >
                  <span className="mobile-bottom-nav__icon">{item.icon}</span>
                  <span className="mobile-bottom-nav__label">{item.label}</span>
                </Link>
                  }
            </>
          )
        })}
      </nav>

      {/* Spacer so content isn't hidden behind the nav */}
      <div className="mobile-bottom-nav__spacer d-block d-md-none" />
    </>
  )
}