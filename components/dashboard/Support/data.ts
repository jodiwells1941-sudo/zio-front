import { FaqItemType, SupportCardType, TopicItem } from "@/types/SupportTypes";

export const topics: TopicItem[] = [
  { title: 'Account', imgSrc: '/images/new/01.png', glowClass: 'glow-green' },
  { title: 'Support', imgSrc: '/images/new/02.png', glowClass: 'glow-blue' },
  { title: 'Bonus promotions', imgSrc: '/images/new/03.png', glowClass: 'glow-orange' },
  { title: 'Winning', imgSrc: '/images/new/04.png', glowClass: 'glow-purple' },
  { title: 'Education', imgSrc: '/images/new/05.png', glowClass: 'glow-blue-dark' },
  { title: 'Security', imgSrc: '/images/new/06.png', glowClass: 'glow-yellow' },
  { title: 'Retailers', imgSrc: '/images/new/07.png', glowClass: 'glow-blue-light' },
  { title: 'Partnerships', imgSrc: '/images/new/08.png', glowClass: 'glow-red' },
];

export const faqs: FaqItemType[] = [
  {
    id: 1,
    question: 'What can I do if I forgot my password?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent tincidunt consequat lectus, a pharetra ante semper ac. Fusce non tempus quam. Aenean varius fringilla aliquam.',
  },
  {
    id: 2,
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent tincidunt consequat lectus, a pharetra ante semper ac.',
  },
  {
    id: 3,
    question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent tincidunt consequat lectus, a pharetra ante semper ac.',
  },
  {
    id: 4,
    question: 'Nam vel neque ut eros mollis bibendum vel ac nisl.',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent tincidunt consequat lectus, a pharetra ante semper ac. Fusce non tempus quam. Aenean varius fringilla aliquam. Nam at lacus et diam vestibulum sagittis. Fusce eget luctus risus. Maecenas in dignissim massa.',
  },
];

export const supportCards: SupportCardType[] = [
  {
    title: 'Talk to our support team',
    description: 'Got a question about Lotteries? Get in touch with our friendly staff.',
    imgSrc: '/images/new/09.png',
    buttonText: 'Contact us',
  },
  {
    title: 'Our Guide to Lode.',
    description: 'Check out our FAQ section to see if we can provide the information you need.',
    imgSrc: '/images/new/10.png',
    buttonText: 'Help center',
  },
];