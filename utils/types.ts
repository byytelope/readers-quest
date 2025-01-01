export type StoryTheme = "animals" | "adventure" | "friends";
export type Story = {
  title: string;
  tags: string;
  description: string;
  content: string[];
};
export type Stories = { animals: Story; adventure: Story; friends: Story };
export type Feedback =
  | { type: "missing" | "extra" | "correct"; word: string }
  | { type: "mispronounced"; expected: string; word: string };
export type ApiResult = {
  grade: number;
  frustrated: boolean;
  feedback: Feedback[];
};

export const getFriendlyFeedback = (feedback: Feedback[]) =>
  feedback
    .map((item) => {
      switch (item.type) {
        case "missing":
          return `You missed the word "${item.word}"`;
        case "extra":
          return `You said an extra word "${item.word}"`;
        case "correct":
          return `You said "${item.word}" correctly`;
        case "mispronounced":
          return `You mispronounced "${item.word}". Expected: "${item.expected}"`;
      }
    })
    .join("\n");

export interface ConversationContent {
  child: string[];
  ai: string[];
}

export const sentences = [
  "The cat is on the mat.",
  "I like ice cream.",
  "She has a red balloon.",
];

export const conversation: ConversationContent = {
  child: [
    "Hi! How are you today?",
    "What did you do today?",
    "I had some ice cream.",
    "Do you like ice cream?",
    "Can you tell me a joke?",
  ],
  ai: [
    "Hello! I'm feeling great today, thank you for asking. How about you?",
    "I helped some people with their tasks today. It was fun!",
    "Yum! Ice cream sounds delicious. What flavor did you have?",
    "I think I would love ice cream too, especially chocolate flavor!",
    "Sure! Here's a joke: Why don't skeletons fight each other? Because they don't have the guts!",
  ],
};

export const stories: Stories = {
  animals: {
    title: "The Jungle Adventure",
    tags: "Adventure, Jungle, Treasure",
    description:
      "In a lush jungle, a brave tiger sets out on an adventure to find the hidden treasure. Join the tiger on this thrilling quest!",
    content: [
      "In a big green jungle, there lived a brave tiger named Tommy.",
      "One day, Tommy found an old map under a tree.",
      "The map showed a hidden treasure deep in the jungle!",
      "Tommy followed the map, crossing rivers and climbing rocks.",
      "Along the way, he met a clever monkey and a helpful parrot.",
      "Together, they found the treasure chest filled with shiny gold coins and sparkling jewels.",
      '"We did it!" said Tommy.',
      "The jungle animals cheered, and they all celebrated with a big feast.",
    ],
  },
  adventure: {
    title: "The Mountain Quest",
    tags: "Adventure, Mountain, Exploration",
    description:
      "Scale the mighty mountains and uncover hidden secrets as you embark on an unforgettable journey.",
    content: [
      "Lila and her dog Max loved adventures.",
      "One sunny day, they decided to climb the big blue mountain.",
      "They packed sandwiches and water in a small bag.",
      "The path was steep and rocky, but Lila and Max didn’t give up.",
      "They saw pretty flowers and colorful birds on their way.",
      "At the top, they found a shiny stone that sparkled in the sunlight.",
      '"This is our lucky stone," said Lila.',
      "She and Max smiled as they enjoyed the view.",
      "It was a perfect day!",
    ],
  },
  friends: {
    title: "The Friendship Tale",
    tags: "Friends, Cooperation, Fun",
    description:
      "Join a group of friends as they navigate challenges and celebrate victories together.",
    content: [
      "Ben, Mia, and Sam were best friends.",
      "One day, they found a broken swing in the park.",
      '"Let’s fix it!" said Mia.',
      "Ben brought a rope, and Sam found a strong board.",
      "They worked together, laughing and sharing ideas.",
      "Soon, the swing was ready.",
      "Ben pushed Mia, and Sam cheered.",
      "Other kids came to play too.",
      "Everyone had so much fun!",
      'Ben said, "Teamwork makes everything better."',
      "They all agreed, and their friendship grew even stronger.",
    ],
  },
};

export const passingMessages = [
  "🥳 Awesome! Keep going!",
  "👏 Great job! Keep it up!",
  "😄 Fantastic work! Continue on!",
];

export const failingMessages = [
  "🥲 Oops... Try again.",
  "🫣 Not quite, give it another shot!",
  "😓 Keep practicing, you'll get it!",
];

export const getAward = (grade: number) => {
  if (grade >= 0.8) {
    return { message: "You earned a Gold Award!", emoji: "🎖️" };
  }
  if (grade >= 0.65) {
    return { message: "You earned a Silver Award!", emoji: "🥈" };
  }
  if (grade >= 0.5) {
    return { message: "You earned a Bronze Award!", emoji: "🥉" };
  }
  return { message: "Keep practicing to earn an award!", emoji: "😊" };
};
