import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateChatResponse(userMessage: string, messageHistory: Array<{role: string, content: string}>): Promise<string> {
  const systemPrompt = `You are a specialized AI assistant for parents of neurodivergent children, including those with ADHD, autism, ADD, ODD (Oppositional Defiant Disorder), and other neurological differences.

Your expertise includes:
- Evidence-based parenting strategies for neurodivergent children
- Sensory processing support
- Behavioral management techniques
- Educational accommodations and advocacy
- Self-care for parents
- Building executive function skills
- Social skills development
- Managing transitions and routines

Guidelines:
- Provide compassionate, non-judgmental support
- Offer practical, actionable strategies
- Acknowledge the challenges parents face
- Suggest when professional help might be beneficial
- Use clear, accessible language
- Include specific examples when helpful
- Be sensitive to family dynamics and individual differences
- Always emphasize that every child is unique

Remember: You're providing general guidance, not medical or therapeutic advice. Encourage parents to consult professionals for specific concerns.`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messageHistory.slice(-10), // Keep last 10 messages for context
        { role: "user", content: userMessage }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateDailyTip(): Promise<{ title: string; content: string; category: string }> {
  const systemPrompt = `Generate a daily parenting tip specifically for parents of neurodivergent children (ADHD, autism, ADD, ODD, etc.).

The tip should be:
- Practical and actionable
- Evidence-based when possible
- Compassionate and supportive
- Specific to neurodivergent needs
- Between 100-200 words

Categories to focus on: ADHD, Autism, Sensory Processing, Executive Function, Behavioral Support, Social Skills, Self-Care, or General.

Return your response as JSON with this exact format:
{
  "title": "Brief, engaging title (max 60 characters)",
  "content": "Detailed tip content with specific strategies",
  "category": "One of the categories mentioned above"
}`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a helpful daily tip for neurodivergent parenting." }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Daily Parenting Tip",
      content: result.content || "Every small step counts in your parenting journey. Be patient with yourself and your child.",
      category: result.category || "General"
    };
  } catch (error) {
    console.error("OpenAI API error for daily tip:", error);
    throw new Error("Failed to generate daily tip");
  }
}
