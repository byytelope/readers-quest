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


export const getFriendlyFeedback = (feedback: Feedback[]) => feedback.map((item) => {
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
  }).join("\n");

