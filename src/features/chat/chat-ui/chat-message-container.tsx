import ChatLoading from "@/components/chat/chat-loading";
import ChatRow from "@/components/chat/chat-row";
import { useChatScrollAnchor } from "@/components/hooks/use-chat-scroll-anchor";
import { AI_NAME } from "@/features/theme/customise";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useChatContext } from "./chat-context";
import { ChatHeader } from "./chat-header";
import { userSession } from "@/features/auth/helpers";

export const ChatMessageContainer = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Specify the email to filter
  const { data: session } = useSession();
  const emailToFilter = session?.user.email;
  const { messages, isLoading } = useChatContext();
  const displayedMessages = messages.filter(
    (msg) => msg.name === emailToFilter || !msg.name
  );
  useChatScrollAnchor(messages, scrollRef);

  return (
    <div className="h-full rounded-md overflow-y-auto " ref={scrollRef}>
      <div className="flex justify-center p-4">{/* <ChatHeader /> */}</div>
      <div className=" pb-[80px] flex flex-col justify-end  flex-1">
        {displayedMessages.map((message, index) => (
          <ChatRow
            name={message.role === "user" ? session?.user?.name! : AI_NAME}
            profilePicture={
              message.role === "user" ? session?.user?.image! : "/ai-icon.png"
            }
            message={message.content}
            type={message.role}
            key={index}
          />
        ))}
        {isLoading && <ChatLoading />}
      </div>
    </div>
  );
};
