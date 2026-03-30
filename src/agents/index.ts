import { Message, Product, AgentType, Phase } from "@/lib/types";
import { informerSystemPrompt, informerFallback } from "./informer";
import { catalogSystemPrompt, catalogFallback } from "./catalog";
import { checkoutSystemPrompt, checkoutFallback } from "./checkout";
import OpenAI from "openai";

export function detectPhase(messages: Message[]): Phase {
  const recent = messages.slice(-6);

  for (let i = recent.length - 1; i >= 0; i--) {
    const content = recent[i].content;
    if (content.includes("[PHASE:checkout]")) return "checkout";
    if (content.includes("[PHASE:browsing]")) return "browsing";
    if (content.includes("[PHASE:completed]")) return "completed";
  }

  // Check agent type of recent messages
  for (let i = recent.length - 1; i >= 0; i--) {
    if (recent[i].agentType === "checkout") return "checkout";
    if (recent[i].agentType === "catalog") return "browsing";
  }

  return "inquiry";
}

export function phaseToAgent(phase: Phase): AgentType {
  switch (phase) {
    case "checkout":
    case "completed":
      return "checkout";
    case "browsing":
      return "catalog";
    case "inquiry":
    default:
      return "informer";
  }
}

function getSystemPrompt(agentType: AgentType, products: Product[]): string {
  switch (agentType) {
    case "checkout":
      return checkoutSystemPrompt(products);
    case "catalog":
      return catalogSystemPrompt(products);
    case "informer":
    default:
      return informerSystemPrompt(products);
  }
}

function getFallbackResponse(agentType: AgentType, userMessage: string, products: Product[]): string {
  switch (agentType) {
    case "checkout":
      return checkoutFallback(userMessage, products);
    case "catalog":
      return catalogFallback(userMessage, products);
    case "informer":
    default:
      return informerFallback(userMessage);
  }
}

interface RunAgentParams {
  agentType: AgentType;
  userMessage: string;
  products: Product[];
  history: Message[];
}

interface RunAgentResult {
  response: string;
  suggestedPhase?: Phase;
}

export async function runAgent({ agentType, userMessage, products, history }: RunAgentParams): Promise<RunAgentResult> {
  let response: string;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey) {
    try {
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
      });

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: getSystemPrompt(agentType, products) },
        ...history.slice(-10).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: userMessage },
      ];

      const completion = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      response = completion.choices[0]?.message?.content || getFallbackResponse(agentType, userMessage, products);
    } catch {
      response = getFallbackResponse(agentType, userMessage, products);
    }
  } else {
    response = getFallbackResponse(agentType, userMessage, products);
  }

  // Detect phase transitions in response
  let suggestedPhase: Phase | undefined;
  if (response.includes("[PHASE:checkout]")) suggestedPhase = "checkout";
  else if (response.includes("[PHASE:browsing]")) suggestedPhase = "browsing";
  else if (response.includes("[PHASE:completed]")) suggestedPhase = "completed";

  return { response, suggestedPhase };
}
