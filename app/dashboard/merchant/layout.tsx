import type { ReactNode } from "react";

export default function MerchantLayout({ children }: { children: ReactNode }) {
  return <div className="merchant-route-shell bg-dark rounded">{children}</div>;
}
