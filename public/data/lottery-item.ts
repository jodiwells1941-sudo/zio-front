import { StaticImageData } from "next/image";
import one from "@/public/images/result/one.png";
import two from "@/public/images/result/two.png";
import three from "@/public/images/result/three.png";
import four from "@/public/images/result/four.png";
import five from "@/public/images/result/five.png";
import six from "@/public/images/result/six.png";

export interface LotteryItem {
  id: number;
  image: StaticImageData;
  alt: string;
  title: string;
  price: string;
  drawTime: string;
  categories: string[];
}

const LotteryItemData: LotteryItem[] = [
  {
    id: 0,
    image: four,
    alt: "Treasure Draw",
    title: "Treasure Draw",
    price: "$12.85",
    drawTime: "2026-01-05T15:37:25",
    categories: ["car", "laptop"],
  },
  {
    id: 1,
    image: one,
    alt: "Drive & Win",
    title: "Drive & Win",
    price: "$12.85",
    drawTime: "2026-02-01T12:00:00",
    categories: ["bike", "laptop", "watch", "cycle"],
  },
  {
    id: 2,
    image: two,
    alt: "Wheel Triumph",
    title: "Wheel Triumph",
    price: "$12.85",
    drawTime: "2025-12-20T18:30:00",
    categories: ["car", "bike", "laptop", "watch"],
  },
  {
    id: 3,
    image: three,
    alt: "Luxury Wheels",
    title: "Luxury Wheels",
    price: "$12.85",
    drawTime: "2025-11-15T10:00:00",
    categories: ["car", "bike", "watch", "cycle"],
  },
  {
    id: 4,
    image: five,
    alt: "Treasure Draw",
    title: "Treasure Draw",
    price: "$19.85",
    drawTime: "2025-12-25T09:00:00",
    categories: ["car", "bike", "watch", "cycle"],
  },
  {
    id: 5,
    image: six,
    alt: "Fast Lane Lottery",
    title: "Fast Lane Lottery",
    price: "$12.85",
    drawTime: "2025-10-10T21:00:00",
    categories: ["car", "bike", "laptop", "cycle"],
  },
];

export default LotteryItemData;
