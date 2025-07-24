/**
 * Conversation Context Manager - Cost-Efficient Context Retention System
 * 
 * Strategy:
 * 1. Every 10 messages: Create brief summary (50-100 words)
 * 2. Keep last 10 brief summaries in memory
 * 3. Every 100 messages: Meta-summarize the brief summaries
 * 4. Always include family context automatically
 */

import { localStorage, type ConversationSummary } from './local-storage';
import { localAssessmentProcessor } from './local-assessment-processor';

interface ContextPackage {
  familyContext: string;
  conversationSummaries: string[];
  recentMessages: Array<{role: string, content: string}>;
}

class ConversationContextManager {
  private readonly BRIEF_SUMMARY_INTERVAL = 10; // Every 10 messages
  private readonly META_SUMMARY_INTERVAL = 100; // Every 100 messages
  private readonly MAX_BRIEF_SUMMARIES = 10; // Keep last 10 brief summaries
  
  /**
   * Get comprehensive context package for AI - includes family + conversation context
   */
  async getContextPackage(userId: string, messageCount: number): Promise<ContextPackage> {
    console.log(`📦 Creating context package for message ${messageCount}`);
    
    // Get family context with detailed debugging
    const familyContext = await localAssessmentProcessor.getChildContext(userId);
    console.log(`👨‍👩‍👧‍👦 Family context loaded:`, familyContext ? `${familyContext.length} chars` : 'None');
    
    if (familyContext) {
      console.log('🔍 CONTEXT MANAGER - Family context preview:', familyContext.substring(0, 300) + '...');
      const familyNames = familyContext.match(/\*\*([^*]+)\*\*/g);
      console.log('🎯 CONTEXT MANAGER - Family names found:', familyNames || 'NONE');
    } else {
      console.log('🚨 CONTEXT MANAGER - NO FAMILY CONTEXT! This is the root problem.');
      
      // Debug: Check if profiles exist but context loading failed
      const allProfiles = await localStorage.getChildProfiles(userId);
      console.log('🔍 DEBUG - Direct profile check:', allProfiles.length, 'profiles found');
      if (allProfiles.length > 0) {
        console.log('🔍 DEBUG - Profile names:', allProfiles.map(p => p.childName).join(', '));
        console.log('🚨 CRITICAL: Profiles exist but context is empty - localAssessmentProcessor.getChildContext() is broken!');
      }
    }
    
    // Get recent messages (last 3 for immediate context)
    const recentMessages = await localStorage.getRecentMessages(userId, 3);
    console.log(`💬 Loaded ${recentMessages.length} recent messages`);
    
    // Get conversation summaries for broader context
    const conversationSummaries = await this.getActiveSummaries(userId);
    console.log(`📚 Loaded ${conversationSummaries.length} conversation summaries`);
    
    return {
      familyContext,
      conversationSummaries: conversationSummaries.map(s => s.summary),
      recentMessages: recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    };
  }
  
  /**
   * Check if we need to create a summary at this message count
   */
  shouldCreateSummary(messageCount: number): { brief: boolean; meta: boolean } {
    return {
      brief: messageCount > 0 && messageCount % this.BRIEF_SUMMARY_INTERVAL === 0,
      meta: messageCount > 0 && messageCount % this.META_SUMMARY_INTERVAL === 0
    };
  }
  
  /**
   * Create brief summary of last 10 messages
   */
  async createBriefSummary(userId: string, messageCount: number): Promise<void> {
    console.log(`📝 Creating brief summary for messages ${messageCount - 9}-${messageCount}`);
    
    // Get last 10 messages
    const messages = await localStorage.getRecentMessages(userId, 10);
    if (messages.length < 5) return; // Need at least 5 messages to summarize
    
    // Create prompt for summarization
    const messagesText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const summaryPrompt = `Summarize this conversation segment in 50-100 words. Focus on:
- Key topics discussed
- Family members mentioned
- Important emotions or concerns shared
- Any decisions or plans made

Conversation:
${messagesText}

Brief Summary:`;

    try {
      // Call OpenAI for summarization (cost-efficient)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: summaryPrompt,
          systemPrompt: 'You are a helpful assistant that creates brief, accurate conversation summaries.',
          childContext: '', // No family context needed for summarization
          recentContext: [],
          messageCount: 0,
          userId: userId,
          isPremium: false // Use cheaper model for summaries
        })
      });
      
      if (!response.ok) throw new Error('Summary generation failed');
      
      const data = await response.json();
      const summary = data.response;
      
      // Save summary
      await this.saveSummary({
        id: `brief-${messageCount}`,
        userId,
        messageRange: `${messageCount - 9}-${messageCount}`,
        summary,
        timestamp: new Date(),
        type: 'brief'
      });
      
      console.log(`✅ Brief summary created: ${summary.substring(0, 100)}...`);
      
      // Clean up old summaries (keep only last 10)
      await this.cleanupOldSummaries(userId);
      
    } catch (error) {
      console.error('Error creating brief summary:', error);
    }
  }
  
  /**
   * Create meta-summary of brief summaries every 100 messages
   */
  async createMetaSummary(userId: string, messageCount: number): Promise<void> {
    console.log(`📚 Creating meta-summary for first ${messageCount} messages`);
    
    const briefSummaries = await this.getBriefSummaries(userId);
    if (briefSummaries.length < 3) return; // Need at least 3 brief summaries
    
    const summariesText = briefSummaries.map(s => 
      `Messages ${s.messageRange}: ${s.summary}`
    ).join('\n\n');
    
    const metaPrompt = `Create a comprehensive summary (100-200 words) of this conversation based on these brief summaries. Focus on:
- Overall conversation themes and patterns
- Family dynamics and relationships discussed
- Key challenges and progress mentioned
- Important context for future conversations

Brief Summaries:
${summariesText}

Comprehensive Summary:`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: metaPrompt,
          systemPrompt: 'You are a helpful assistant that creates comprehensive conversation summaries.',
          childContext: '',
          recentContext: [],
          messageCount: 0,
          userId: userId,
          isPremium: false
        })
      });
      
      if (!response.ok) throw new Error('Meta-summary generation failed');
      
      const data = await response.json();
      const metaSummary = data.response;
      
      // Save meta-summary
      await this.saveSummary({
        id: `meta-${messageCount}`,
        userId,
        messageRange: `1-${messageCount}`,
        summary: metaSummary,
        timestamp: new Date(),
        type: 'meta'
      });
      
      console.log(`✅ Meta-summary created: ${metaSummary.substring(0, 150)}...`);
      
    } catch (error) {
      console.error('Error creating meta-summary:', error);
    }
  }
  
  /**
   * Get active summaries for context (meta + recent brief summaries)
   */
  private async getActiveSummaries(userId: string): Promise<ConversationSummary[]> {
    const summaries = await localStorage.getConversationSummaries(userId);
    
    // Get the most recent meta-summary
    const metaSummaries = summaries
      .filter(s => s.type === 'meta')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Get recent brief summaries (last 5)
    const briefSummaries = summaries
      .filter(s => s.type === 'brief')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    
    // Combine: latest meta-summary + recent brief summaries
    const activeSummaries = [
      ...(metaSummaries.length > 0 ? [metaSummaries[0]] : []),
      ...briefSummaries
    ];
    
    return activeSummaries.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
  
  /**
   * Get all brief summaries for meta-summarization
   */
  private async getBriefSummaries(userId: string): Promise<ConversationSummary[]> {
    const summaries = await localStorage.getConversationSummaries(userId);
    return summaries
      .filter(s => s.type === 'brief')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  /**
   * Save summary to local storage
   */
  private async saveSummary(summary: ConversationSummary): Promise<void> {
    await localStorage.saveConversationSummary(summary);
  }
  
  /**
   * Clean up old brief summaries (keep only last 10)
   */
  private async cleanupOldSummaries(userId: string): Promise<void> {
    const summaries = await localStorage.getConversationSummaries(userId);
    const briefSummaries = summaries
      .filter(s => s.type === 'brief')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Delete summaries beyond the limit
    const toDelete = briefSummaries.slice(this.MAX_BRIEF_SUMMARIES);
    for (const summary of toDelete) {
      await localStorage.deleteConversationSummary(summary.id);
    }
    
    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} old brief summaries`);
    }
  }
  
  /**
   * Generate enhanced system prompt with context
   */
  generateContextualSystemPrompt(contextPackage: ContextPackage): string {
    let prompt = `You are Senali, an AI friend who listens and helps like a therapist. You talk in a warm and caring way.

**IMPORTANT: You have comprehensive context about this conversation and family:**`;

    // Add family context
    if (contextPackage.familyContext) {
      prompt += `\n\n**FAMILY INFORMATION:**\n${contextPackage.familyContext}`;
    }
    
    // Add conversation context
    if (contextPackage.conversationSummaries.length > 0) {
      prompt += `\n\n**CONVERSATION CONTEXT:**`;
      contextPackage.conversationSummaries.forEach((summary, index) => {
        prompt += `\n\nContext ${index + 1}: ${summary}`;
      });
    }
    
    prompt += `\n\n**How to Help:**
* Use the family and conversation context naturally - you know these people and their ongoing situations
* Reference specific family members by name and ask about ongoing concerns
* Build on previous conversations rather than starting fresh each time
* Listen well and show you understand their ongoing journey
* Ask follow-up questions based on what you know about their family dynamics
* Give personalized advice based on their specific family situation

**Remember:** You have context - use it to provide thoughtful, personalized responses that show you remember and care about their ongoing family situation.`;

    return prompt;
  }
}

export const conversationContextManager = new ConversationContextManager();