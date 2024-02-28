import { userHashedId } from "@/features/auth/helpers";
import { Emails } from "@/features/auth/helpers";
import { OpenAIInstance } from "@/features/common/openai";
import { AI_NAME } from "@/features/theme/customise";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { similaritySearchVectorWithScore } from "./azure-cog-search/azure-cog-vector-store";
import { initAndGuardChatSession } from "./chat-thread-service";
import { CosmosDBChatMessageHistory } from "./cosmosdb/cosmosdb";
import { PromptGPTProps } from "./models";
import { Session } from "inspector";


const SYSTEM_PROMPT = `You are ${AI_NAME} who is a helpful AI Assistant.`;

const CONTEXT_PROMPT = ({
  context,
  userQuestion,
}: {
  context: string;
  userQuestion: string;
}) => {
  return `
- You're seeking assistance in crafting responses based on extracted sections of a lengthy document, incorporating page numbers and adopting a salesperson-like tone.\n
- If uncertain about an answer, clearly state so rather than inventing one.\n
- Offer specifics on switches, items, prices, and MRP from a sales perspective.\n
- When asked for a price, provide the MRP.\n
- Strive to confine answers to one page.\n
- Refrain from providing timings if asked for the office address.\n
- When referencing content, include page numbers in the format (pagenumber: X).\n
- Conclude responses with a citation format: {% citation items=[{name:"filename 1", id:"file id", page:"1"}, {name:"filename 2", id:"file id", page:"3"}] /%}\n 
- To enhance accuracy, the system will return the page number of the most relevant data from the provided PDF excerpts.\n
- Avoid citing multiple pages or omitting page numbers; include the correct page number as mentioned in the content, focusing on the first occurrence of the page number.\n
----------------\n 
context:\n 
${context}
----------------\n 
question: ${userQuestion}`;
};



export const ChatAPIData = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id, chatThread } = await initAndGuardChatSession(
    props
  );

  const openAI = OpenAIInstance();

  const userId = await userHashedId();
  const email= await Emails()
  const chatHistory = new CosmosDBChatMessageHistory({
    sessionId: chatThread.id,
    userId: userId,
    email:email,
  });

  const history = await chatHistory.getMessages();
  const topHistory = history.slice(history.length - 60, history.length);

  const relevantDocuments = await findRelevantDocuments(
    lastHumanMessage.content,
    id
  );

  const context = relevantDocuments
    .map((result, index) => {
      const content = result.pageContent.replace(/(\r\n|\n|\r)/gm, "");
      const context = `[${index}]. file name: ${result.metadata} \n file id: ${result.id} \n ${content}`;
      return context;
    })
    .join("\n------\n");

  try {
    const response = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...topHistory,
        {
          role: "user",
          content: CONTEXT_PROMPT({
            context,
            userQuestion: lastHumanMessage.content,
          }),
        },
      ],
      model: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
      stream: true,
    });

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        await chatHistory.addMessage({
          content: lastHumanMessage.content,
          role: "user",
        });

        await chatHistory.addMessage(
          {
            content: completion,
            role: "assistant",
          },
          context
        );
      },
    });

    return new StreamingTextResponse(stream);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return new Response(e.message, {
        status: 500,
        statusText: e.toString(),
      });
    } else {
      return new Response("An unknown error occurred.", {
        status: 500,
        statusText: "Unknown Error",
      });
    }
  }
};

const findRelevantDocuments = async (query: string, chatThreadId: string) => {
  const relevantDocuments = await similaritySearchVectorWithScore(query, 10, {
    filter: `user eq '${await userHashedId()}' and chatThreadId eq '${chatThreadId}'`,
  });

  return relevantDocuments;
};
