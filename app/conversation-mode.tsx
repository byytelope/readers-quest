import ConversationScreen from "@/components/ConversationScreen";
import { conversation } from "@/utils/types";

export default function ConversationModeScreen() {
  return (
    <ConversationScreen
      conversation={conversation}
      title="Conversation"
      subtitle="Pronounce perfectly to find an animal friend!"
    />
  );
}
