export type StoryTheme = "animals" | "adventure" | "friends";
export type Story = {
  title: string;
  tags: string;
  description: string;
  content: string[];
};
export type Stories = { animals: Story; adventure: Story; friends: Story };
