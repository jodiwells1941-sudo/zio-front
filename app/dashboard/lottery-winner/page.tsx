'use client'

import { useEffect, useState } from "react";
import BettingWinners from "@/components/containers/lottery/BettingWinners";
import BreadcrumbTwo from "@/components/layout/banner/BreadcrumbTwo";
import { getLotteryWinners } from "@/app/api/lottery";
import LotterySkeleton from "@/components/dashboard/LotterySkeleton";

const page = () => {
    const [winners, setWinners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    const getWinners = async () => {
        setLoading(true);
        const res = await getLotteryWinners();
        setWinners(res?.data || []);
        setLoading(false);
    };

    useEffect(() => {
        getWinners();
    }, []);    

    if (loading) return <LotterySkeleton />;

    return (
        <div>
            <BreadcrumbTwo title="Lottery Winner" />
            
            <div className="pt-5 mt-md-5">
                <BettingWinners winners={winners} />
            </div>
        </div>
    );
};

export default page;
