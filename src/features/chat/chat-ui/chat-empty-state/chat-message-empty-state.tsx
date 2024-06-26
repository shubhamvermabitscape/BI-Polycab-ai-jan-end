import Typography from "@/components/typography";
import { Card } from "@/components/ui/card";
import { FC } from "react";
import { useChatContext } from "../chat-context";
import { ChatFileUI } from "../chat-file/chat-file-ui";
import { ChatStyleSelector } from "./chat-style-selector";
import { useSession } from "next-auth/react";
import { ChatTypeSelector } from "./chat-type-selector";
import { Divide } from "lucide-react";

interface Prop {
  AdminEmail: string;
}

export const ChatMessageEmptyState: FC<Prop> = (props) => {
  const { fileState } = useChatContext();

  const { showFileUpload } = fileState;
  const { data: session } = useSession();
  const hasvalue = props.AdminEmail.includes(session?.user.email || "");

  return (
    <div className="grid sm:grid-cols-5 w-full items-center container mx-auto max-w-3xl justify-center sm:h-full sm:gap-9 gap-y-4 mt-5 sm:mt-0">
      {hasvalue ? (
        <>
          <div className="col-span-2 gap-5 flex flex-col flex-1 items-center sm:items-start w-72">
            <img src="/ai-icon.png" className="sm:w-28 w-16" />
            <p className="text-center sm:text-start">
              AskMe anything about Polycab Products
            </p>
          </div>
          <Card className="col-span-3 flex flex-col gap-2 p-5 ">
            <Typography variant="h4" className="text-primary">
              Upload File
            </Typography>

            <div className="flex flex-col gap-2">
              {/* <p className="text-sm text-muted-foreground">
            Choose a conversation style
          </p> */}
              {/* <ChatStyleSelector disable={false} /> */}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                How would you like to chat?
              </p>
              <ChatTypeSelector disable={false} />
            </div>
            {showFileUpload === "data" && <ChatFileUI />}
          </Card>
        </>
      ) : (
        <div className="col-span-5 place-self-center gap-5 flex flex-col flex-1 items-center sm:items-start text-center sm:text-start text-primary font-bold">
          The file was not uploaded by the admin.
        </div>
      )}
    </div>
  );
};
