export type GoogleReview = {
  author: string;
  reviewCount: number;
  rating: number;
  timeAgo: string;
  text: string;
  translated?: boolean;
};

/** Real reviews from Bestcrea's Google Business Profile (5.0 ★, 8 reviews). */
export const googleReviews: GoogleReview[] = [
  {
    author: "wizzy memes",
    reviewCount: 2,
    rating: 5,
    timeAgo: "3 mois",
    text: "Best developer in the world 🥰😍",
  },
  {
    author: "Marouan Bahtit",
    reviewCount: 1,
    rating: 5,
    timeAgo: "3 mois (modifié)",
    text: "The number one 📱✅",
  },
  {
    author: "يونس أبو السمح",
    reviewCount: 6,
    rating: 5,
    timeAgo: "3 mois (modifié)",
    text: "Service pur et professionnel, que Dieu vous protège.",
    translated: true,
  },
  {
    author: "Taoufik Dalouch",
    reviewCount: 1,
    rating: 5,
    timeAgo: "3 mois",
    text: "Meilleur développeur.",
    translated: true,
  },
  {
    author: "malika ergibi",
    reviewCount: 2,
    rating: 5,
    timeAgo: "3 mois (modifié)",
    text: "❤️🙏 Meilleur designer de sites web.",
    translated: true,
  },
  {
    author: "MUSTAPHA IBENNAIN",
    reviewCount: 2,
    rating: 5,
    timeAgo: "2 ans",
    text: "Service impeccable ✅",
    translated: true,
  },
  {
    author: "Mr MOUSSAID",
    reviewCount: 1,
    rating: 5,
    timeAgo: "3 mois",
    text: "🙏 Bon service",
  },
  {
    author: "Azzeddine Kharaz",
    reviewCount: 5,
    rating: 5,
    timeAgo: "2 ans",
    text: "🔥🔥🔥🔥",
  },
];

export const googleReviewsAverage = 5.0;
export const googleReviewsTotal = googleReviews.length;
