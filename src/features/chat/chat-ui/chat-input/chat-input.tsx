import React, { FC, useState } from "react";
import { useChatContext } from "@/features/chat/chat-ui/chat-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Send } from "lucide-react";
import { FormEvent, useRef } from "react";
import { ChatFileSlider } from "../chat-file/chat-file-slider";
import { Microphone } from "../chat-speech/microphone";
import { useChatInputDynamicHeight } from "./use-chat-input-dynamic-height";
import { useSession } from "next-auth/react";
import { CitationPDFSlider } from "../markdown/citation-pdf-slider";
import { useGlobalConfigContext } from "@/features/global-config/global-client-config-context";

interface SuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const Suggestions: FC<SuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  return (
    <div className="flex container justify-center gap-3 sm:gap-10 flex-wrap">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="sm:w-fit w-full text-red-600 sm:text-sm lg:text-sm font-semibold p-1 px-2 sm:border-red-400 border-red-300 border-2 sm:shadow-2xl shadow-red-500 rounded-xl hover:bg-red-100 cursor-pointer"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

interface Props {
  AdminEmail: string;
}

const ChatInput: FC<Props> = (props) => {
  const { setInput, handleSubmit, isLoading, input, chatBody } =
    useChatContext();

  const { speechEnabled } = useGlobalConfigContext();
  const { data: session } = useSession();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // const admin = session?.user.email === props.AdminEmail;
  const hasvalue = props.AdminEmail.includes(session?.user.email||"")

  const { rows, resetRows, onKeyDown, onKeyUp } = useChatInputDynamicHeight({
    buttonRef,
  });

  const fileChatVisible =
    chatBody.chatType === "data" && chatBody.chatOverFileName;

  const [suggestions, setSuggestions] = useState<string[]>([
    "Explain Warranty of Switches",
    "Explain Color of Switches",
    "MRP of SLV0102401/02 - 10A 2-way Switch 2M in White color",
  ]);

  const onSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    resetRows();
    setInput("");
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  return (
    <form onSubmit={submit} className="absolute bottom-0 w-full items-center">
      <Suggestions
        suggestions={suggestions}
        onSuggestionClick={onSuggestionClick}
      />
      <div className="container mx-auto max-w-4xl relative py-2 flex gap-2 items-center">
        {/* Suggestions Component */}
        {fileChatVisible && hasvalue && <ChatFileSlider />}
        <Textarea
          rows={rows}
          value={input}
          placeholder="Send a message"
          className="min-h-fit bg-background shadow-sm resize-none py-4 pr-[80px]"
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          onChange={onChange}
        ></Textarea>
        <div className="absolute right-0 bottom-0 px-8 flex items-end h-full mr-2 mb-4">
          {speechEnabled && <Microphone disabled={isLoading} />}
          <Button
            size="icon"
            type="submit"
            variant={"ghost"}
            ref={buttonRef}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </Button>
          {/* <CitationPDFSlider blobName={blobName}/> */}
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
