import AffiliatePage from "@/components/dashboard/Affiliate/AffiliatePage";

export default function Page() {
  return (
    <AffiliatePage
      profile={{
        name: "Robert Fox",
        avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        levelLabel: "Level 1",
        commissionLabel: "11% Commission",
        availableAmount: "$0.00",
      }}
      stats={{
        totalEarnings: "$0.00",
        usersReferred: 2,
        last30Days: "$0.00",
      }}
      referral={{ link: "https://likeafaucet.com/r/e8ac" }}
      referredUsers={[
        { id: "u1", name: "Annette Black", avatarSrc: "https://i.pravatar.cc/100?img=1", registered: "14 Apr 2023", time: "01 Jan 17:30", totalEarned: "0.00" },
        { id: "u2", name: "Darrell Steward", avatarSrc: "https://i.pravatar.cc/100?img=2", registered: "14 Apr 2023", time: "01 Jan 17:30", totalEarned: "0.00" },
        { id: "u3", name: "Courtney Henry", avatarSrc: "https://i.pravatar.cc/100?img=3", registered: "14 Apr 2023", time: "01 Jan 17:30", totalEarned: "0.00" },
        { id: "u4", name: "Savannah Nguyen", avatarSrc: "https://i.pravatar.cc/100?img=4", registered: "14 Apr 2023", time: "01 Jan 17:30", totalEarned: "0.00" },
      ]}
      pagination={{ current: 3, pages: [1, 2, 3, 4], showDots: true }}
    />
  );
}