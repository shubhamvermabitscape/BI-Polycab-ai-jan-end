import { FindAllChats } from "@/features/chat/chat-services/chat-service";
import { FindChatThreadByID } from "@/features/chat/chat-services/chat-thread-service";
import { ChatProvider } from "@/features/chat/chat-ui/chat-context";
import { ChatUI } from "@/features/chat/chat-ui/chat-ui";
import { item } from "@markdoc/markdoc/dist/src/schema";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { id: string } }) {
  // console.log(params)
  const [items, thread] = await Promise.all([
    FindAllChats(params.id),
    FindChatThreadByID(params.id),
    
  ]);
  const Admin=process.env.ADMIN_EMAIL_ADDRESS
  if (thread.length === 0) {
    notFound();
  }
  
  return (
    <ChatProvider id={params.id} chats={items}  chatThread={thread[0]}>
      <ChatUI AdminEmail={Admin}/>
    </ChatProvider>
  );
}
