import { localStorage } from '../lib/local-storage';
import { localAssessmentProcessor } from '../lib/local-assessment-processor';
import type { Message } from '../lib/local-storage';

export class LocalChatService {
  private userId: string = 'user-1'; // Simple user ID for local storage

  async init(): Promise<void> {
    await localStorage.init();
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

    // Get child context for personalized responses
    let childContext = '';
    try {
      childContext = await localAssessmentProcessor.getChildContext(this.userId);
      console.log('👶 Loaded child context for personalized responses');
    } catch (error) {
      console.error('Error loading child context:', error);
    }

    // Get conversation history for context (last 10 messages to include in API call)
    const messageHistory = await this.getMessageHistory(10);
    
    // Call the server API for AI response with conversation context
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        childContext: childContext, // Include context for personalized responses
        conversationHistory: messageHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    
    // Save AI response locally
    const aiMessage = await localStorage.saveMessage({
      content: data.response,
      role: 'assistant',
      userId: this.userId,
      timestamp: new Date()
    });

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

  async clearAllData() {
    return await localStorage.clearAllData();
  }
}

export const localChatService = new LocalChatService();