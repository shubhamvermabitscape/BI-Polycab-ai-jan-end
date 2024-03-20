"use client";

import { FC, useEffect } from "react";
import { useChatContext } from "./chat-context";
import { ChatMessageEmptyState } from "./chat-empty-state/chat-message-empty-state";
import ChatInput from "./chat-input/chat-input";
import { ChatMessageContainer } from "./chat-message-container";
import { Router } from "next/router";

interface Prop {
  AdminEmail: string;
}

export const ChatUI: FC<Prop> = (props) => {
  const { messages } = useChatContext();
  // useEffect(()=>{
  //   window.location.reload()
  // },[messages])
  return (
    <div className="overflow-hidden flex-1 bg-card rounded-md shadow-md w-[calc(100%-9px)] sm:w-[calc(100%-80px)] h-[calc(100%-9px)] sm:h-[calc(100%-16px)] absolute">
      {messages.length !== 0 ? (
        <ChatMessageContainer />
      ) : (
        <ChatMessageEmptyState AdminEmail={props.AdminEmail} />
      )}

      <ChatInput AdminEmail={props.AdminEmail} />
    </div>
  );
};
