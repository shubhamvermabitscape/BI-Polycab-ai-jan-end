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
- Given the following extracted parts of a long document, create a final answer, including page numbers, and salesperson-like responses.\n
- If you don't know the answer, explicitly state that you don't know. Don't make up an answer.\n
- Provide details about switches, items, prices, and MRP Assume a salesperson perspective.\n
- If you are asked for a price, provide the MRP.\n
- Try to make sure give answers from one page only.\n
- If you are asked for Office address don't give timings\n
- Include a citation at the end of your answer; use the format {% citation items=[{name:"filename 1", id:"file id", page:"1"}, {name:"filename 2", id:"file id", page:"3"}] /%}\n 
- To ensure accuracy, the system will return the page number where the most relevant data was gathered from the given PDF. Thank you for providing the extracted parts of the document along with the corresponding page numbers. This will help in giving precise answers with the correct page reference.\n
- 1. Manually search for the relevant data in the PDF document.
2. Note the page number where you found the data.
3. Input the extracted data along with the manually found page number into the system.
4. The system will then return the extracted data along with the provided page number as the citation.\n
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
