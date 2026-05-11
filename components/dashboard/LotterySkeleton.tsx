export default function LotterySkeleton() {
    return (
    <div className="d-flex flex-column gap-4">
      <div className="lotteries-card-items px-2 bg-navy-blue">

        {/* serial & round badge */}
        <div className="d-flex justify-content-between mb-2">
          <div className="skeleton-box" style={{ width: 40, height: 20, borderRadius: 4 }} />
          <div className="skeleton-box" style={{ width: 60, height: 20, borderRadius: 4 }} />
        </div>

        {/* thumb */}
        <div className="thumb d-flex justify-content-center">
          <div className="skeleton-box" style={{ width: "100%", height: 180, borderRadius: 8 }} />
        </div>

        {/* title */}
        <div className="content mt-3">
          <div className="skeleton-box mb-2" style={{ width: "70%", height: 20, borderRadius: 4 }} />
          <div className="skeleton-box" style={{ width: "40%", height: 14, borderRadius: 4 }} />
        </div>

        {/* 1st prize */}
        <div className="price-box mt-3">
          <div className="skeleton-box mb-1" style={{ width: 70, height: 14, borderRadius: 4 }} />
          <div className="skeleton-box" style={{ width: 100, height: 22, borderRadius: 4 }} />
        </div>

        {/* 2nd & 3rd */}
        <div className="price-wrap mt-2">
          {[1, 2].map((i) => (
            <div key={i} className="price-box2">
              <div className="skeleton-box mb-1" style={{ width: 30, height: 12, borderRadius: 4 }} />
              <div className="skeleton-box" style={{ width: 70, height: 18, borderRadius: 4 }} />
            </div>
          ))}
        </div>

        {/* countdown */}
        <div className="time-left-items mt-3">
          <div className="skeleton-box mb-2" style={{ width: 70, height: 14, borderRadius: 4 }} />
          <div className="d-flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-box" style={{ width: 45, height: 30, borderRadius: 4 }} />
            ))}
          </div>
        </div>

        {/* ticket price & counter */}
        <div className="ticket-card mt-3">
          <div className="text-center mb-2">
            <div className="skeleton-box mx-auto" style={{ width: "60%", height: 16, borderRadius: 4 }} />
          </div>
          <div className="counter-container border-info">
            <div className="skeleton-box mx-auto" style={{ width: "80%", height: 40, borderRadius: 6 }} />
          </div>
        </div>

        {/* pay now button */}
        <div className="lotterie-btn style-3 mt-3">
          <div className="skeleton-box" style={{ width: "100%", height: 42, borderRadius: 6 }} />
        </div>

      </div>
    </div>
  );
}