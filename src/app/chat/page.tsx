import { Card } from "@/components/ui/card";
import { StartNewChat } from "@/features/chat/chat-ui/chat-empty-state/start-new-chat";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <Card className="items-center flex justify-center flex-1 w-[calc(100%-9px)] sm:w-[calc(100%-80px)] h-[calc(100%-9px)] sm:h-[calc(100%-16px)] absolute">
      <StartNewChat />
    </Card>
  );
}
