
import Image from "next/image";
import TopRoundCard from "./TopRoundCard";
import TopInvestmentSection from "./TopInvestmentCard";
import LatestRoundSection from "./LatestRoundSection";

export default function RightSidebar({ open }: { open: boolean }) {

  return (
    <div className="sidebar-width flex-shrink-0 shadow">
      <div className={`border border-dark-light contest-box-items sidebar-width right-sidebar-fixed scrollbar-transparent ${open ? 'active right-box-bg' : ''}`}>
        <h2 className="main-head border-bottom border-dark-light mb-4">
          🏆 Top Lottery Prize
        </h2>

        <TopRoundCard />

        <h2 className="main-head border-bottom border-dark-light mb-4 mt-4">
          💵 Investment
        </h2>

        <TopInvestmentSection />

        <h2 className="main-head border-bottom border-dark-light mb-4 mt-4">
          💵 Latest Lottery Results
        </h2>

        <LatestRoundSection />

        <h2 className="main-head border-bottom border-dark-light mb-4 mt-4">
          🎧 Online Supports
        </h2>

        <div>
          <div className="d-flex align-items-center gap-sm-3 gap-2">
            <div className="w-15 h-15 rounded-circle overflow-hidden bg-white d-flex justify-content-center align-items-center flex-shrink-0">
              <Image src="/images/support-img.png" alt="Support Image" width={60} height={60} />
            </div>
            <div className="flex-shrink-0">
              <p className="text-white">
                Do you have questions about the lottery? Please chat with our friendly staff.
              </p>
            </div>
          </div>

          <form action="#" className="copy-input-wrapper position-relative mt-24">
            <textarea className="copy-input py-4 form-control rounded-3" placeholder="Message..."></textarea>
            <button type="submit" className="position-absolute top-50 translate-middle-y end-0 me-4">
              <i className="fa-regular fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}