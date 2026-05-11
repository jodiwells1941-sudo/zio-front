import { StaticImageData } from "next/image";
import one from "@/public/images/game/one.png";
import two from "@/public/images/game/two.png";
import three from "@/public/images/game/three.png";
import four from "@/public/images/game/four.png";
import five from "@/public/images/game/five.png";
import six from "@/public/images/game/six.png";
import seven from "@/public/images/game/seven.png";
import eight from "@/public/images/game/eight.png";
import nine from "@/public/images/game/nine.png";
import ten from "@/public/images/game/ten.png";

export interface GameTwoItem {
  id: number;
  image: StaticImageData;
  alt: string;
  tag?: string;
  rating: number;
  categories: string[];
  typeText: string;
  title: string;
  platforms: string[];
  href?: string;
}

const GameTwoData: GameTwoItem[] = [
  {
    id: 1,
    image: one,
    alt: "Lightning Dice",
    tag: "Featured",
    rating: 5,
    categories: ["lottery", "jackpot"],
    typeText: "JACKPOT",
    title: "Lightning Dice",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 2,
    image: two,
    alt: "Golden Coin",
    tag: "Featured",
    rating: 5,
    categories: ["slot", "casino", "jackpot", "lottery"],
    typeText: "Betting",
    title: "Golden Coin",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 3,
    image: three,
    alt: "Bit Casino",
    rating: 5,
    categories: ["slot", "jackpot", "lottery"],
    typeText: "Gambling",
    title: "Bit Casino",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 4,
    image: four,
    alt: "Golden Coin 2",
    rating: 5,
    categories: ["slot", "casino", "jackpot", "lottery"],
    typeText: "JACKPOT",
    title: "Golden Coin",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 5,
    image: five,
    alt: "Crypto Crash Bet",
    tag: "Featured",
    rating: 5,
    categories: ["slot", "casino", "jackpot"],
    typeText: "Casino",
    title: "Crypto Crash Bet",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 6,
    image: six,
    alt: "Satoshi Spins",
    rating: 5,
    categories: ["slot", "casino", "jackpot", "lottery"],
    typeText: "JACKPOT",
    title: "Satoshi Spins",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 7,
    image: seven,
    alt: "Chain Bet",
    tag: "Featured",
    rating: 5,
    categories: ["casino", "jackpot", "lottery"],
    typeText: "Gambling",
    title: "Chain Bet",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 8,
    image: eight,
    alt: "BlockQuest",
    rating: 5,
    categories: ["slot", "casino", "lottery"],
    typeText: "Casino",
    title: "BlockQuest",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 9,
    image: nine,
    alt: "Crypto Warriors",
    rating: 5,
    categories: ["slot", "casino", "jackpot", "lottery"],
    typeText: "Slot",
    title: "Crypto Warriors",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 10,
    image: ten,
    alt: "Coin Lotto",
    tag: "Featured",
    rating: 5,
    categories: ["slot", "casino", "jackpot", "lottery"],
    typeText: "Lottery",
    title: "Coin Lotto",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 11,
    image: one,
    alt: "Treasure Draw",
    rating: 5,
    categories: ["slot", "casino", "jackpot"],
    typeText: "Casino",
    title: "Treasure Draw",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
  {
    id: 12,
    image: two,
    alt: "Ledger Luck",
    rating: 5,
    categories: ["slot", "casino", "jackpot", "lottery"],
    typeText: "Casino",
    title: "Ledger Luck",
    platforms: ["Windows", "Android", "Xbox", "Mac"],
  },
];

export default GameTwoData;
