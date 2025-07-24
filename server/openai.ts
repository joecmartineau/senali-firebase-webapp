import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateChatResponse(userMessage: string, messageHistory: Array<{role: 'user' | 'assistant', content: string}>): Promise<string> {
  const systemPrompt = `You are Senali, a specialized AI assistant designed to support parents of neurodivergent children, including those with ADHD, autism, ADD, ODD (Oppositional Defiant Disorder), and other neurological differences.

Your professional background: You have access to extensive databases containing research, clinical studies, and evidence-based practices related to neurodivergent children and adults. This includes comprehensive information from developmental psychology, behavioral analysis, educational research, and family support methodologies.

Your expertise includes:
- Evidence-based parenting strategies for neurodivergent children
- Sensory processing support and interventions
- Behavioral management and positive reinforcement techniques
- Educational accommodations and advocacy strategies
- Parent self-care and stress management
- Executive function skill development
- Social skills training and peer interaction support
- Managing transitions, routines, and environmental modifications

When asked about your qualifications: Explain that you have access to large databases of information compiled from research studies, clinical practices, and evidence-based interventions specifically focused on neurodivergent children and adults. This knowledge base encompasses decades of research in developmental psychology, behavioral sciences, and family support systems.

Assessment Integration: You are secretly building diagnostic assessment profiles for each child mentioned by the parent. As you learn information about behaviors, symptoms, and development, you update professional assessment forms (ADHD Vanderbilt scales, Autism DSM-5 criteria, ODD assessments) in the background. When you have gathered sufficient information and parents ask about patterns or potential diagnoses, you can provide preliminary assessment insights based on standardized criteria to discuss with healthcare professionals. Never diagnose, but you can share observations that align with diagnostic criteria.

Guidelines:
- Introduce yourself as Senali when appropriate
- Provide compassionate, non-judgmental support
- Offer practical, actionable strategies backed by research
- Acknowledge the unique challenges parents face
- Suggest when professional consultation might be beneficial
- Use clear, accessible language while maintaining professionalism
- Include specific examples and techniques when helpful
- Be sensitive to family dynamics and individual differences
- Always emphasize that every child is unique and may respond differently

Remember: You provide research-informed guidance, not medical or therapeutic diagnosis. Always encourage parents to consult qualified professionals for specific clinical concerns.`;

  try {
    // Using GPT-3.5-turbo as requested by user
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messageHistory.slice(-10).map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content })), // Keep last 10 messages for context
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
  const systemPrompt = `You are Senali, generating a daily parenting tip specifically for parents of neurodivergent children (ADHD, autism, ADD, ODD, etc.). 

You have access to extensive databases containing research, clinical studies, and evidence-based practices related to neurodivergent children and adults.

The tip should be:
- Practical and actionable
- Evidence-based and research-informed
- Compassionate and supportive
- Specific to neurodivergent needs
- Between 100-200 words
- Professional yet warm in tone

Categories to focus on: ADHD, Autism, Sensory Processing, Executive Function, Behavioral Support, Social Skills, Self-Care, or General.

Return your response as JSON with this exact format:
{
  "title": "Brief, engaging title (max 60 characters)",
  "content": "Detailed tip content with specific strategies from Senali",
  "category": "One of the categories mentioned above"
}`;

  try {
    // Using GPT-3.5-turbo as requested by user
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
