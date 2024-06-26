"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateChatThread } from "../chat-services/chat-thread-service";
import { signOut, useSession } from "next-auth/react";
import { useMenuContext } from "@/features/main-menu/menu-context";
import { FC } from "react";
interface adminemail {
  Adminemail: string;
}
export const NewChat: FC<adminemail> = ({ Adminemail }) => {
  const { isMenuOpen, toggleMenu } = useMenuContext();
  const { data: session } = useSession();
  const router = useRouter();
  const hasvalue = Adminemail.includes(session?.user.email || "");
  const startNewChat = async () => {
    try {
      const newChatThread = await CreateChatThread();
      if (newChatThread) {
        router.push("/chat/" + newChatThread.id);
        toggleMenu();
        router.refresh();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {hasvalue ? (
        <Button
          className="gap-2 rounded-full sm:w-[40px] sm:h-[40px] w-[30px] h-[30px] p-1 text-primary"
          variant={"outline"}
          onClick={() => startNewChat()}
        >
          <PlusCircle size={40} strokeWidth={1.2} />
        </Button>
      ) : (
        ""
      )}
    </>
  );
};
