"use client";

import P2PHeaderButton from "../wallet/components/P2PHeaderButton";
import { usePathname } from "next/navigation";

export default function P2PTopNav() {
  const pathname = usePathname();  

  return (
    <div className="border-bottom border-dark-light pb-2 wallet-main-wrapprr">
      <div className="container p2pTopNavInner">
        <div className="p2pTopLeft">
          <div className="p2pTopTabs">
            <h6 className="p2pTopTab active text-md-xl text-xs">
              {pathname == '/dashboard/orders/' && 'Orders'}
              {pathname == '/dashboard/ads/' && 'Ads'}
              {pathname == '/dashboard/chat/' && 'Chat'}
              {pathname == '/dashboard/p2p-profile/' && 'Profile'}
            </h6>
          </div>
        </div>

        <P2PHeaderButton />

        {/* <div className="p2pTopRight">
          <button className="p2pTopBtn">
            <i className="fa-regular fa-file-lines" /> Orders <span className="p2pBadge d-flex justify-content-center align-items-center">1</span>
          </button>
          <button className="p2pTopBtn">
            <i className="fa-regular fa-comments" /> Chat <span className="p2pBadge d-flex justify-content-center align-items-center">25</span>
          </button>
          <button className="p2pTopBtn">
            <i className="fa-regular fa-user" /> User Center
          </button>
          <button className="p2pTopBtn">
            <i className="fa-solid fa-ellipsis" /> More <i className="fa-solid fa-angle-down" />
          </button>
        </div> */}
      </div>
    </div>
  );
}