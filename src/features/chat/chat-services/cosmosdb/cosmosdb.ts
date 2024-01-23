import {
  FindAllChats,
  UpsertChat,
} from "@/features/chat/chat-services/chat-service";
import {
  ChatMessageModel,
  MESSAGE_ATTRIBUTE,
} from "@/features/chat/chat-services/models";
import { CosmosDBContainer } from "@/features/common/cosmos";
import { uniqueId } from "@/features/common/util";
import { ChatCompletionMessage } from "openai/resources";

export interface CosmosDBChatMessageHistoryFields {
  sessionId: string;
  userId: string;
  email:string;
}

export class CosmosDBChatMessageHistory {
  private sessionId: string;
  private userId: string;
  email: string;

  constructor({ sessionId, userId,email}: CosmosDBChatMessageHistoryFields) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.email=email
  }

  async getMessages(): Promise<ChatCompletionMessage[]> {
    const chats = await FindAllChats(this.sessionId);
   
    return mapOpenAIChatMessages(chats);
    
  }

  async clear(): Promise<void> {
    const container = await CosmosDBContainer.getInstance().getContainer();
    await container.delete();
  }

  async addMessage(message: ChatCompletionMessage, citations: string = "") {
    const modelToSave: ChatMessageModel = {
      id: uniqueId(),
      createdAt: new Date(),
      type: MESSAGE_ATTRIBUTE,
      isDeleted: false,
      content: message.content ?? "",
      role: message.role,
      threadId: this.sessionId,
      userId: this.userId,
      context: citations,
      email:this.email,
    };

    await UpsertChat(modelToSave);
  }
}

function mapOpenAIChatMessages(
  messages: ChatMessageModel[]
): ChatCompletionMessage[] {
  return messages.map((message) => {
    return {
      role: message.role,
      content: message.content,
      // email:message.email
    };
  });
}
