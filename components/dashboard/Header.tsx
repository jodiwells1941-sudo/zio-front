"use client";

import { useAuth } from "@/hooks/useAuth";
import { fetchUserInfoAPI } from "@/app/api/auth";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification,
} from "@/app/api/notifications";
import { getTradeEcho } from "@/utils/tradeEcho";
import { playChatChime } from "@/utils/chatSound";
import { logout } from "@/utils/auth";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

type NotificationItem = {
  name?: string;
  title?: string;
  message: string;
  time: string;
  isActiveBg?: boolean;
};

type Props = {
  userName?: string;
  balance?: string;
  notificationsCount?: string;
  notifications?: NotificationItem[];
};

type User = {
  id?: number | string;
  name?: string;
  wallet?: {
    id?: number | string;
    amount?: number | string;
  };
};

export default function Header({
  
  notificationsCount = "0",
  notifications = [],
}: Props) {
  const toggleLeftSidebar = useCallback(() => {
    document.querySelector(".left-sidebar-area")?.classList.toggle("active");
  }, []);

  const depositClick = useCallback(() => {
    // hook API / open modal etc
    // console.log("Deposit click");
  }, []);

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { isLoggedIn, user } = useAuth() as { isLoggedIn: boolean; user: User | null };
  const walletId = user?.wallet?.id;
  const userId = user?.id;
  const [walletAmount, setWalletAmount] = useState(() => Number(user?.wallet?.amount ?? 0));
  const [notificationItems, setNotificationItems] = useState<UserNotification[]>(() => notifications.map((item, index) => ({
    id: -(index + 1),
    type: "legacy",
    title: item.title ?? item.name ?? "Notification",
    message: item.message,
    read_at: item.isActiveBg ? null : new Date().toISOString(),
    created_at: undefined,
  })));
  const [unreadNotifications, setUnreadNotifications] = useState(() => Number(notificationsCount) || 0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const knownNotificationIds = useRef<Set<number>>(new Set());
  const notificationsInitialized = useRef(false);

  const formatNotificationTime = useCallback((value?: string | null) => {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }, []);

  useEffect(() => {
    if (!isLoggedIn || userId === undefined || userId === null) {
      setNotificationItems([]);
      setUnreadNotifications(0);
      knownNotificationIds.current.clear();
      notificationsInitialized.current = false;
      return;
    }

    knownNotificationIds.current.clear();
    notificationsInitialized.current = false;
    let active = true;
    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const result = await getNotifications();
        if (!active) return;
        const newItems = (result.items ?? []).filter(item => !knownNotificationIds.current.has(item.id));
        if (notificationsInitialized.current && newItems.some(item => !item.read_at)) playChatChime();
        for (const item of result.items ?? []) knownNotificationIds.current.add(item.id);
        notificationsInitialized.current = true;
        setNotificationItems(result.items ?? []);
        setUnreadNotifications(Number(result.unread_count ?? 0));
      } catch {
        // Keep the existing list during temporary API failures; realtime can still recover it.
      } finally {
        if (active) setNotificationsLoading(false);
      }
    };

    void loadNotifications();

    const echo = getTradeEcho();
    const channelName = `user.${userId}`;
    const channel = echo?.private(channelName);
    const handleNotification = (payload: { notification?: UserNotification }) => {
      const incoming = payload?.notification;
      if (!incoming?.id) return;
      if (knownNotificationIds.current.has(incoming.id)) return;
      knownNotificationIds.current.add(incoming.id);
      setNotificationItems(current => [incoming, ...current.filter(item => item.id !== incoming.id)].slice(0, 30));
      setUnreadNotifications(count => count + (incoming.read_at ? 0 : 1));
      if (!incoming.read_at) playChatChime();
      if (incoming.type === "profile.verification_approved") {
        void fetchUserInfoAPI().then(response => {
          if (!response?.data) return;
          localStorage.setItem("user", JSON.stringify(response.data));
          window.dispatchEvent(new CustomEvent("authStateChanged", {
            detail: { isAuthenticated: true, user: response.data },
          }));
        }).catch(() => undefined);
      }

      if (typeof window !== "undefined" && document.visibilityState === "hidden" && "Notification" in window && Notification.permission === "granted") {
        new Notification(incoming.title, { body: incoming.message });
      }
    };

    channel?.listen(".notification.created", handleNotification);

    const poll = window.setInterval(() => {
      if (document.visibilityState !== "hidden") void loadNotifications();
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(poll);
      channel?.stopListening(".notification.created", handleNotification);
      if (echo) echo.leave(channelName);
    };
  }, [formatNotificationTime, isLoggedIn, userId]);

  const handleNotificationClick = useCallback(async (notification: UserNotification) => {
    if (!notification.read_at) {
      setNotificationItems(current => current.map(item => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item));
      setUnreadNotifications(count => Math.max(0, count - 1));
      try {
        await markNotificationRead(notification.id);
      } catch {
        // The optimistic state is preferable to blocking navigation on a transient failure.
      }
    }
  }, []);

  const handleMarkAllRead = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setNotificationItems(current => current.map(item => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    setUnreadNotifications(0);
    try {
      await markAllNotificationsRead();
    } catch {
      // Reconcile on the next notification refresh if the request fails.
    }
  }, []);

  const handleNotificationBellClick = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  // Keep the local display in sync when auth data is refreshed or changed in
  // another part of the app.
  useEffect(() => {
    const nextAmount = Number(user?.wallet?.amount ?? 0);
    if (Number.isFinite(nextAmount)) setWalletAmount(nextAmount);
  }, [user?.wallet?.amount]);

  useEffect(() => {
    if (!isLoggedIn || walletId === undefined || walletId === null) return;

    const channelName = `wallet-balance.${walletId}`;
    const echo = getTradeEcho();

    const applyAmount = (value: unknown) => {
      const nextAmount = Number(value);
      if (Number.isFinite(nextAmount)) setWalletAmount(nextAmount);
    };

    const refreshBalance = async () => {
      try {
        const response = await fetchUserInfoAPI();
        applyAmount(response?.data?.wallet?.amount);
      } catch {
        // Realtime is best-effort; keep the last known amount on transient
        // auth/network failures and let the next refresh try again.
      }
    };

    let channel: ReturnType<NonNullable<typeof echo>["channel"]> | null = null;
    if (echo) {
      channel = echo.channel(channelName);
      channel.listen(".wallet-balance.update", (payload: { data?: { amount?: number | string } }) => {
        applyAmount(payload?.data?.amount);
      });
    }

    // Reconcile once immediately in case the cached auth object is stale.
    void refreshBalance();

    // Wallet model events are the fast path. This fallback covers a dropped
    // websocket, a reconnect, or a balance changed before the channel joined.
    const poll = window.setInterval(() => {
      if (document.visibilityState !== "hidden") void refreshBalance();
    }, 15000);
    const onFocus = () => void refreshBalance();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
      if (channel && echo) {
        channel.stopListening(".wallet-balance.update");
        echo.leave(channelName);
      }
    };
  }, [isLoggedIn, walletId]);

    // const deleteCookie = (name: string) => {
    //   // Try multiple approaches to ensure cookie deletion
    //   const domains = [
    //   window.location.hostname,
    //   `.${window.location.hostname}`,
    //   window.location.hostname.split('.').slice(-2).join('.')
    //   ];
      
    //   const paths = ['/', '/dashboard', ''];
      
    //   domains.forEach(domain => {
    //   paths.forEach(path => {
    //     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
    //     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    //   });
    //   });
    // };

    const handleLogout = async () => {
      // Delete the httpOnly cookie via API route (cannot be done client-side)
      await fetch("/api/auth/logout", { method: "POST" });

      // Clear localStorage / in-memory auth state
      logout();

      window.location.href = "/sign-in";
    };

    useEffect(() => {
      if (!isLoggedIn) {
        window.location.href = "/";
      }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = '/';
        }
    }, [isLoggedIn]);

  return (
    <header className={`bg-navy-blue header py-2 z_index${isSticky ? ' sticky-header' : ''}`}>
      <div className="container-flouid px-3">
        <div className="row">
          <div className="col-12">
            <div className="main-header__menu-box">
              <nav className="navbar p-0 gap-2">
                <div className="d-flex align-items-center gap-sm-3 gap-2">
                  <div className="navbar-logo d-none d-xl-block">
                    <a href={"/"}>
                      <img src="/images/logo.png" alt="Image" />
                    </a>
                  </div>

                  <div className="navbar-logo2 d-xl-none">
                    <a href="index.html">
                      <img src="/images/phone-logo.png" alt="Image" />
                    </a>
                  </div>

                  <button
                    type="button"
                    className="left-sidebar-btn d-xl-none d-flex"
                    onClick={toggleLeftSidebar}
                  >
                    <i className="fa-solid fa-bars"></i>
                  </button>
                </div>

                <div className="border border-dark-light rounded-pill py-2 px-sm-3 px-2 d-flex align-items-center gap-1 d-md-none">
                  <span className="d-none d-md-block">
                    <img src="/images/coin.png" alt="Coin" />
                  </span>
                  <span className="text-white fw-bold text-xl">${walletAmount.toFixed(2)}</span>
                </div>

                <div className="navbar__options">
                  <div
                    className="d-flex align-items-center gap-md-3 gap-2"
                  >
                    {/* Deposit Button */}
                    <div className="wallet-menu position-relative">
                      <button
                        type="button"
                        title="Play Lottery"
                        className="btn--secondary py-lg-2 py-1 px-3 d-sm-flex d-none"
                        onClick={depositClick}
                      >
                        Deposit
                      </button>
                      <ul className="wallet-submenu">
                        <li>
                          <a href="/dashboard/wallet/?tab=tab1">Balance</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab2">Deposit</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab3">P2P</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab4">Transfer</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab5">Withdraw</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab6">
                            Transactions History
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Wallet Balance */}
                    <div className="wallet-menu position-relative d-md-flex d-none border border-dark-light rounded-pill py-2 px-sm-3 px-2 align-items-center gap-1 bg-dark">
                      <span>
                        <img src="/images/coin.png" alt="Coin" />
                      </span>

                      <span className="text-white">
                        {walletAmount.toFixed(2)}
                      </span>

                      <ul className="wallet-submenu">
                        <li>
                          <a href="/dashboard/wallet/?tab=tab1">Balance</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab2">Deposit</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab3">P2P</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab4">Transfer</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab5">Withdraw</a>
                        </li>

                        <li>
                          <a href="/dashboard/wallet/?tab=tab6">
                            Transactions History
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="dropdown">
                      <button
                        className="squire-btn d-sm-flex d-none position-relative"
                        aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}
                        title="Notification Dropdown"
                        type="button"
                        onClick={handleNotificationBellClick}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="outside"
                      >
                        <i className="fa-regular fa-bell"></i>
                        {unreadNotifications > 0 && <span className="header-notification-badge">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
                      </button>

                      <button
                        className="d-sm-none d-flex h5 mb-0 me-2 me-md-0 position-relative"
                        aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}
                        title="Notification Dropdown"
                        type="button"
                        onClick={handleNotificationBellClick}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="outside"
                      >
                        <i className="fa-regular fa-bell"></i>
                        {unreadNotifications > 0 && <span className="header-notification-badge">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
                      </button>

                      <div className="dropdown-menu end-0 left-auto notification-dropdown rounded-4 header-notification-menu">
                        <div className="py-2 px-3 m-3 d-flex align-items-center justify-content-between gap-2 header-notification-heading">
                          <div>
                            <span className="header-notification-eyebrow">Activity center</span>
                            <h6 className="text-lg text-primary-light fw-semibold mb-0">
                              Notifications
                            </h6>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <span className="header-notification-count">{unreadNotifications}</span>
                            <button type="button" className="header-notification-clear" onClick={handleMarkAllRead} disabled={unreadNotifications === 0}>
                              Mark all read
                            </button>
                          </div>
                        </div>

                        <div className="max-h-400-px overflow-y-auto scroll-sm d-flex flex-column">
                          {notificationsLoading && notificationItems.length === 0 ? (
                            <div className="header-notification-empty"><i className="fa-solid fa-spinner fa-spin" /> Loading notifications…</div>
                          ) : notificationItems.length > 0 ? notificationItems.map(notification => (
                            <a
                              key={notification.id}
                              href={notification.data?.url ?? "/dashboard/local-buy-sell/my-orders"}
                              onClick={() => void handleNotificationClick(notification)}
                              className={`px-3 py-2 d-flex align-items-start gap-3 justify-content-between notification-item header-notification-item ${notification.read_at ? "is-read" : "is-unread"}`}
                            >
                              <div className="d-flex align-items-start gap-3">
                                <span className="header-notification-icon">
                                  <i className={notification.type.startsWith("profile.") ? "fa-solid fa-user-check" : notification.type.includes("completed") ? "fa-solid fa-check" : notification.type.includes("appeal") ? "fa-solid fa-scale-balanced" : "fa-solid fa-arrow-right-arrow-left"} />
                                </span>
                                <div className="header-notification-copy">
                                  <h6>{notification.title}</h6>
                                  <p>{notification.message}</p>
                                  <small>{notification.data?.scope ?? "P2P"}</small>
                                </div>
                              </div>
                              <span className="header-notification-time">{formatNotificationTime(notification.created_at)}</span>
                            </a>
                          )) : (
                            <div className="header-notification-empty">
                              <i className="fa-regular fa-bell-slash" />
                              No notifications yet
                            </div>
                          )}
                        </div>

                        <div className="text-center py-3">
                          <Link href="/dashboard/local-buy-sell/my-orders" className="header-notification-footer-link">View order activity</Link>
                        </div>
                      </div>
                    </div>

                    <div className="dropdown">
                      <button
                        className="h6 mb-0 dropdown-toggle py-3 text-xl"
                        aria-label="search products"
                        title="User Info Dropdown"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="outside"
                      >
                        <span className="d-sm-block d-none">{user?.name || "User"}</span>
                        <span className="d-sm-none d-flex h5 mb-0 ms-1">
                          <i className="fa-regular fa-user"></i>
                        </span>
                      </button>

                      <div className="dropdown-menu end-0 left-auto p-3 rounded-4">
                        <ul className="d-flex flex-column gap-2">
                          <li>
                            <Link
                              href={"/dashboard/account"}
                              className="text-black d-flex align-items-center gap-2 hover-text-yellow"
                            >
                              <span className="d-flex text-sm w-16-px">
                                <i className="fa-regular fa-user"></i>
                              </span>
                              <span className="d-flex">My Account</span>
                            </Link>
                          </li>

                          <li>
                            <Link
                              href={"/dashboard/wallet"}
                              className="text-black d-flex align-items-center gap-2 hover-text-yellow"
                            >
                              <span className="d-flex text-sm w-16-px">
                                <i className="fa-solid fa-money-bill-transfer"></i>
                              </span>
                              <span className="d-flex">Transactions</span>
                            </Link>
                          </li>

                          <li>
                            <button type="button" onClick={handleLogout}
                              className="text-black d-flex align-items-center gap-2 hover-text-yellow"
                            >
                              <span className="d-flex text-sm w-16-px">
                                <i className="fas fa-sign-out"></i>
                              </span>
                              <span className="d-flex">Log Out</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    className="open-offcanvas-nav d-none"
                    aria-label="toggle mobile menu"
                    title="open offcanvas menu"
                    type="button"
                  >
                    <span className="icon-bar top-bar"></span>
                    <span className="icon-bar middle-bar"></span>
                    <span className="icon-bar bottom-bar"></span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
