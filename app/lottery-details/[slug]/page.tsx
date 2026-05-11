
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Header from "@/components/layout/header/Header";
import Breadcrumb from "@/components/layout/banner/Breadcrumb";
import FooterTwo from "@/components/layout/footer/FooterTwo";
import LotteryDetails from "@/components/containers/lottery/LotteryDetails";

const ClientWrapper = dynamic(
  () => import("@/components/widgets/ClientWrapper")
);

export const generateMetadata = async (): Promise<Metadata> => ({
  title: "Contact Us | Zio Lottery – Online Lottery Platform",
  description:
	"Get in touch with Zio Lottery for support, inquiries, or feedback. We're here to assist you with your online lottery experience.",
  keywords: ["contact", "support", "inquiries", "feedback", "Zio Lottery", "lottery platform"],
});

// Accept params as a prop
const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  return (
    <div className="page-wrapper a-cursor">
      <Header />
      <Breadcrumb title="Lottery Details" />
      <LotteryDetails slug={slug} />
      <FooterTwo />
      <ClientWrapper />
    </div>
  );
};

export default page;