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
    <div className="h-full relative overflow-hidden flex-1 bg-card rounded-md shadow-md">
      {messages.length !== 0 ? (
        <ChatMessageContainer />
      ) : (
        <ChatMessageEmptyState />
      )}
 
      <ChatInput AdminEmail={props.AdminEmail} />
    </div>
  );
};