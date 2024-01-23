import { Menu, MenuContent, MenuHeader } from "@/components/menu";
import { FindAllChatThreadForCurrentUser } from "@/features/chat/chat-services/chat-thread-service";
import { MenuItems } from "./menu-items";
import { NewChat } from "./new-chat";

export const ChatMenu = async () => {
  
  const items = await FindAllChatThreadForCurrentUser();
  const Adminemail:string=process.env.ADMIN_EMAIL_ADDRESS
  
  return (
    <Menu className=" p-2">
      <MenuHeader className="justify-end">
        <NewChat Adminemail={Adminemail}/>
      </MenuHeader>
      <MenuContent>
        <MenuItems menuItems={items} Adminemail={Adminemail} />
      </MenuContent>
    </Menu>
  );
};
