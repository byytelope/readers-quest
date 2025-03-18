import type { Feedback } from "./types";

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// export const isStrongPassword = (password: string) =>
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
//     password,
//   );
export const isStrongPassword = (password: string) => {
  return password.length > 8;
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
