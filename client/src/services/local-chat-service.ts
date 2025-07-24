import { localStorage } from '../lib/local-storage';
import { localAssessmentProcessor } from '../lib/local-assessment-processor';
import { clearWrongProfiles } from '../lib/clear-wrong-profiles';
import { debugProfiles } from '../lib/debug-profiles';
import { subscriptionService } from './subscription-service';
import type { Message } from '../lib/local-storage';

export class LocalChatService {
  private userId: string = 'user-1'; // Simple user ID for local storage

  async init(): Promise<void> {
    await localStorage.init();
    
    // Clean up any incorrectly detected profiles on startup
    // DISABLED for now to prevent losing real child names like Sam and Noah
    // await clearWrongProfiles(this.userId);
    
    console.log('📋 Local chat service initialized, profile cleanup disabled to preserve real names');
  }

  async sendMessage(content: string): Promise<{ userMessage: Message; aiResponse: Message }> {
    // Save user message locally
    const userMessage = await localStorage.saveMessage({
      content,
      role: 'user',
      userId: this.userId,
      timestamp: new Date()
    });

    // Process message for profile and symptom updates locally
    try {
      await localAssessmentProcessor.processMessage(this.userId, content);
      console.log('📊 Profile and symptom data processed locally');
    } catch (error) {
      console.error('Local assessment processing error:', error);
    }

    // ALWAYS extract and save names from every message FIRST
    let childContext = '';
    try {
      // Step 1: Cost-efficient comprehensive profile processing (NO EXTRA API CALLS)
      if (content) {
        // Use the enhanced pattern matcher instead of separate processes
        await localAssessmentProcessor.processMessageEfficient(this.userId, content);
      }
      
      // Step 2: ALWAYS load all existing child context (regardless of current message)
      childContext = await localAssessmentProcessor.getChildContext(this.userId);
      console.log('👶 Loaded comprehensive child context:', childContext ? `Found profiles` : 'No profiles yet');
      
      if (childContext) {
        console.log('📋 Full context being sent to AI:');
        console.log(childContext);
      }
      
      // Step 3: Log all existing family members for debugging
      const allProfiles = await localStorage.getChildProfiles(this.userId);
      if (allProfiles.length > 0) {
        console.log('🏠 Existing family members in storage:', allProfiles.map(p => p.childName).join(', '));
        console.log('🔍 Full profile debug:');
        await debugProfiles(this.userId);
      } else {
        console.log('🏠 No family members found in storage');
      }
      
    } catch (error) {
      console.error('Error processing names and loading child context:', error);
    }

    // Only send minimal context - let AI request more if needed
    const recentMessages = await this.getMessageHistory(3); // Just last 3 messages for immediate context
    
    // Call API for AI response with minimal context
    // For now, always use local dev API since we're still in development
    const apiUrl = '/api/chat';
    
    console.log('🌐 Making API call to:', apiUrl);
    console.log('📝 Request data:', { message: content, childContext, recentContextLength: recentMessages.length });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        childContext: childContext, // Include context for personalized responses
        recentContext: recentMessages.slice(-3).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        userId: this.userId, // Allow server to request more context if needed
        isPremium: subscriptionService.hasPremiumAccess() // Send premium status for model selection
      }),
    }).catch(fetchError => {
      console.error('🚨 Fetch failed:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to get AI response: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response received:', data);
    
    // Save AI response locally
    const aiMessage = await localStorage.saveMessage({
      content: data.response,
      role: 'assistant',
      userId: this.userId,
      timestamp: new Date()
    });
    
    console.log('💾 AI message saved to local storage');

    return {
      userMessage,
      aiResponse: aiMessage
    };
  }

  async getMessageHistory(limit = 200): Promise<Message[]> {
    return await localStorage.getMessages(this.userId, limit);
  }

  async loadConversationHistory(): Promise<Message[]> {
    const messages = await this.getMessageHistory(200);
    
    if (messages.length === 0) {
      // Return welcome message if no history
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hi there! I'm Senali, and I'm here to listen and support you. What's been on your mind lately?",
        role: 'assistant',
        timestamp: new Date(),
        userId: this.userId
      };
      return [welcomeMessage];
    }
    
    // Return messages in chronological order
    return messages.reverse();
  }

  async getChildProfiles() {
    return await localStorage.getChildProfiles(this.userId);
  }

  async getSymptomChecklist(childId: string) {
    return await localStorage.getSymptomChecklist(childId);
  }

  async updateChildProfile(childName: string, updates: any) {
    return await localAssessmentProcessor.updateChildProfile(this.userId, childName, updates);
  }

  async exportData() {
    return await localStorage.exportAllData();
  }

  async clearChatHistory() {
    return await localStorage.clearChatHistory();
  }

  async clearAllData() {
    return await localStorage.clearAllData();
  }
}

export const localChatService = new LocalChatService();