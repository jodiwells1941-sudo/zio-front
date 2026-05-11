import kingCard from "@/public/images/king-card.png";
import one from "@/public/images/game/one.png";
import two from "@/public/images/game/two.png";
import three from "@/public/images/game/three.png";
import four from "@/public/images/game/four.png";

const CryptoPlatformData = [
  {
    id: 0,
    title: "Cryptos Gaming",
    image: kingCard,
    category: "JACKPOT",
    isKingCard: true,
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    href: "game-details",
  },
  {
    id: 1,
    title: "Lightning Dice",
    image: one,
    category: "JACKPOT",
    isKingCard: false,
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    href: "game-details",
  },
  {
    id: 2,
    title: "Golden Coin",
    image: two,
    category: "Betting",
    isKingCard: false,
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    href: "game-details",
  },
  {
    id: 3,
    title: "Bit Casino",
    image: three,
    category: "Gambling",
    isKingCard: false,
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    href: "game-details",
  },
  {
    id: 4,
    title: "Golden Coin",
    image: four,
    category: "JACKPOT",
    isKingCard: false,
    platforms: ["Windows", "Android", "Xbox", "Mac"],
    href: "game-details",
  },
];

export default CryptoPlatformData;
