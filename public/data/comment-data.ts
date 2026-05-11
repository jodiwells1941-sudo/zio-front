import one from "@/public/images/avatar/one.png";
import three from "@/public/images/avatar/three.png";
import four from "@/public/images/avatar/four.png";
import { StaticImageData } from "next/image";

interface CommentDataItem {
  id: number;
  name: string;
  role: string;
  avatar: StaticImageData;
  time: string;
  date: string;
  content: string;
}

const CommentData: CommentDataItem[] = [
  {
    id: 1,
    name: "Kiss Laura",
    role: "Product Designer",
    avatar: one,
    time: "09:01 am",
    date: "Mar 03, 2025",
    content:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here...",
  },
  {
    id: 2,
    name: "Devon Lane",
    role: "Front End Developer",
    avatar: three,
    time: "09:01 am",
    date: "Mar 03, 2025",
    content:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here...",
  },
  {
    id: 3,
    name: "Theresa Webb",
    role: "UI Designer",
    avatar: four,
    time: "09:01 am",
    date: "Mar 03, 2025",
    content:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here...",
  },
];

export default CommentData;
