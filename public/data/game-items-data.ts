import { StaticImageData } from "next/image";
import eleven from "@/public/images/game/eleven.png";
import twelve from "@/public/images/game/twelve.png";
import thirteen from "@/public/images/game/thirteen.png";
import fourteen from "@/public/images/game/fourteen.png";
import fifteen from "@/public/images/game/fifteen.png";
import sixteen from "@/public/images/game/sixteen.png";
import seventeen from "@/public/images/game/seventeen.png";
import eighteen from "@/public/images/game/eighteen.png";
import nineteen from "@/public/images/game/nineteen.png";

export interface GameItem {
  id: number;
  image: StaticImageData;
  alt: string;
  title: string;
  rating: number;
  ratingsCount: string;
  sharePerEarn: string;
  categories: string[];
  platforms: string[];
  exclusive: boolean;
  featured: boolean;
}

const GameItemData: GameItem[] = [
  {
    id: 0,
    image: fifteen,
    alt: "Play Arena",
    title: "Play Arena",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["casino", "jackpot", "lottery"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
  {
    id: 1,
    image: fourteen,
    alt: "Spin Casino",
    title: "Spin Casino",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["slot", "jackpot", "lottery"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
  {
    id: 2,
    image: thirteen,
    alt: "Token Betters",
    title: "Token Betters",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["slot", "casino", "lottery"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
  {
    id: 3,
    image: twelve,
    alt: "Ledger Luck",
    title: "Ledger Luck",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["slot", "casino", "jackpot", "lottery"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
  {
    id: 4,
    image: eleven,
    alt: "Treasure Draw",
    title: "Treasure Draw",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["slot", "casino", "jackpot"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
  {
    id: 5,
    image: nineteen,
    alt: "Jackpot Betting",
    title: "Jackpot Betting",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["slot", "casino", "jackpot", "lottery"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
  {
    id: 6,
    image: eighteen,
    alt: "Lottery Betting",
    title: "Lottery Betting",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["slot", "casino", "jackpot", "lottery"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
  {
    id: 7,
    image: seventeen,
    alt: "Coin Quest",
    title: "Coin Quest",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["slot", "casino", "jackpot", "lottery"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
  {
    id: 8,
    image: sixteen,
    alt: "Crypto Arcade",
    title: "Crypto Arcade",
    rating: 4.9,
    ratingsCount: "5.5K Ratings",
    sharePerEarn: "$2",
    categories: ["slot", "jackpot", "lottery"],
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    exclusive: true,
    featured: true,
  },
];

export default GameItemData;
