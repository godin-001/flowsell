import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConversation, updateConversationPhase, getMessages, saveMessage } from "@/lib/db";
import { getProducts } from "@/lib/db";
import { detectPhase, phaseToAgent, runAgent } from "@/agents";

export async function POST(request: NextRequest) {
  const { customerId, message } = await request.json();

  if (!customerId || !message) {
    return NextResponse.json({ error: "customerId y message son requeridos" }, { status: 400 });
  }

  const conversation = await getOrCreateConversation(customerId);
  const history = await getMessages(conversation.id);
  const products = await getProducts();

  // Detect current phase from history
  const detectedPhase = detectPhase(history);
  const agentType = phaseToAgent(detectedPhase);

  // Save user message
  await saveMessage({
    conversationId: conversation.id,
    role: "user",
    content: message,
  });

  // Run the appropriate agent
  const result = await runAgent({
    agentType,
    userMessage: message,
    products,
    history,
  });

  // Save assistant message
  await saveMessage({
    conversationId: conversation.id,
    role: "assistant",
    content: result.response,
    agentType,
  });

  // Update conversation phase if suggested
  const newPhase = result.suggestedPhase || detectedPhase;
  if (newPhase !== conversation.phase) {
    await updateConversationPhase(conversation.id, newPhase);
  }

  return NextResponse.json({
    response: result.response,
    agentType,
    phase: newPhase,
    conversationId: conversation.id,
  });
}
