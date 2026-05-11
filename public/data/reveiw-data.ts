import one from "@/public/images/avatar/one.png";
import two from "@/public/images/avatar/two.png";
import three from "@/public/images/avatar/three.png";
import four from "@/public/images/avatar/four.png";

const GameReviewsData = {
  averageRating: {
    score: 4.7,
    totalRatings: 26,
    stars: [5, 4, 3, 2, 1],
    distribution: [90, 70, 50, 30, 20],
  },
  reviews: [
    {
      id: 1,
      avatar: one,
      alt: "Kiss Laura",
      name: "Kiss Laura",
      role: "Product Designer",
      time: "09:01 am",
      date: "Mar 03, 2025",
      stars: 5,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here...",
    },
    {
      id: 2,
      avatar: three,
      alt: "Devon Lane",
      name: "Devon Lane",
      role: "Front End Developer",
      time: "09:01 am",
      date: "Mar 03, 2025",
      stars: 5,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here...",
    },
    {
      id: 3,
      avatar: four,
      alt: "Theresa Webb",
      name: "Theresa Webb",
      role: "UI Designer",
      time: "09:01 am",
      date: "Mar 03, 2025",
      stars: 5,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here...",
    },
  ],
  replyAvatar: two,
};

export default GameReviewsData;
