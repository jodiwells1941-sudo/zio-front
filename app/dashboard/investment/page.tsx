import CloseInvestmentSection from "@/components/dashboard/Investment/CloseInvestmentSection";
import InvestmentSection from "@/components/dashboard/Investment/InvestmentSection";
import MyInvestmentSection from "@/components/dashboard/Investment/MyInvestmentSection";
import Image from "next/image";

const baseDescription =
  "Earn up to 40% annual interest on your USD. At maturity,\n the USD & interest will be credited back to your account automatically.";

export default function InvestmentPage() {
  return (
    <>
      {/* Banner Section */}
      <div className="investment-wrapper d-none d-md-block mx-4 mx-xl-0 mb-0">
        <div 
        className="investment-wrapper bg-cover mb-0 mt-2" 
          style={{ backgroundImage: "url('/images/new/investment_bg_gradient.png')" }}
        >
          <div className="content p-5 d-flex justify-content-start mt-5">
            <div className="text-center pb-5">

              <div className="inv-box">
                <span className="inv-corner--tl"></span>
                <span className="inv-corner--tr"></span>
                <span className="inv-corner--bl"></span>
                <span className="inv-corner--br"></span>
                <h3 className="inv-title px-1">Investment</h3>
              </div>
              <div className="inv-logo bg-gradient"></div>

              <h4 className="price text-xxl fw-6 pt-2">$10,000</h4>
              <p>Returns</p>
              <h4 className="price-2 fs-1 fw-8 text-warning">$15,000</h4>
              
              <a href="#" className="investment-btn">
                Invest now <span className='fa-solid fa-angle-right ps-2'></span>
              </a>
              
              <h6>*Guaranteed</h6>
            </div>
          </div>

          <div className="thumb pt-3 pe-3">
            <Image 
              src="/images/new/investment-img.png" 
              alt="Investment illustration" 
              width={900}
              height={900}
              priority
            />
          </div>
        </div>
      </div>

      <div className="my-0 pt-0 bg-cover rounded d-md-none" 
          style={{ backgroundImage: "url('/images/new/investment-img.png')" }}
        >
          <div className="investment-wrapper my-0 pt-0 bg-cover rounded" 
            style={{ backgroundImage: "url('/images/new/bg.png')" }}
          >
            <div className="content d-flex justify-content-start pb-2">
              <div className="text-center px-3 pt-3">
                <div className="inv-box">
                  <span className="inv-corner--tl"></span>
                  <span className="inv-corner--tr"></span>
                  <span className="inv-corner--bl"></span>
                  <span className="inv-corner--br"></span>
                  <h3 className="inv-title px-1">Investment</h3>
                </div>
                <div className="inv-logo bg-gradient"></div>

                <h6 className="fw-6">$10,000</h6>
                <small>Returns</small>
                <h6 className="price-2 fs-5 fw-6 text-warning">$15,000</h6>
                
                <a href="#" className="btn--primary py-1 px-2 d-flex align-items-center justify-content-center text-xs my-2">
                  Invest now <span className='fa-solid fa-angle-right '></span>
                </a>
                
                <small>*Guaranteed</small>
              </div>
            </div>
          </div>
        </div>

      <div className="container">
        <InvestmentSection
          title="Secure Investment Platform"
          description={'Earn up to 40% annual interest on your USD. At maturity,\n the USD & interest will be credited back to your account automatically.'}
          wrapperClassName="investment-history-area mt-100 investment-area"
        />
      </div>


      <MyInvestmentSection
        title="Investment History"
        description={baseDescription}
        wrapperClassName="investment-history-area mt-100 investment-area"
      />

      <CloseInvestmentSection
        title="Close Investment History"
        description={baseDescription}
        wrapperClassName="investment-history-area mt-100 investment-area"
      />

    </>
  );
}