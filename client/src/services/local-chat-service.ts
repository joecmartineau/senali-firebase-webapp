import { localStorage, type ChildProfile } from '../lib/local-storage';
import { localAssessmentProcessor } from '../lib/local-assessment-processor';
import { conversationContextManager } from '../lib/conversation-context-manager';
import { clearWrongProfiles } from '../lib/clear-wrong-profiles';
import { debugProfiles } from '../lib/debug-profiles';
import { subscriptionService } from './subscription-service';
import { getFamilyDiscoveryPrompt, extractFamilyMembers } from '../lib/guided-family-discovery';
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

    // Get message count for context management
    const messageCount = await this.getMessageCount();
    console.log(`💬 Processing message #${messageCount}`);

    // Process message for profile and symptom updates locally
    try {
      await localAssessmentProcessor.processMessageEfficient(this.userId, content);
      console.log('📊 Profile and symptom data processed locally');
    } catch (error) {
      console.error('Local assessment processing error:', error);
    }

    // Extract and create family members from current message (only in first 10 messages)
    if (messageCount <= 10) {
      const newMembers = extractFamilyMembers(content);
      if (newMembers.length > 0) {
        console.log(`🏗️ Creating ${newMembers.length} family profiles...`);
        for (const member of newMembers) {
          await this.createFamilyProfile(member.name, member.age, member.relationship);
        }
      }
    }

    // Get comprehensive context package (family + conversation summaries)
    const contextPackage = await conversationContextManager.getContextPackage(this.userId, messageCount);
    console.log('📦 Context package loaded:', {
      familyMembers: contextPackage.familyContext ? 'YES' : 'NO',
      summaryCount: contextPackage.conversationSummaries.length,
      recentMessages: contextPackage.recentMessages.length
    });

    // Generate contextual system prompt with family and conversation context
    const systemPrompt = conversationContextManager.generateContextualSystemPrompt(contextPackage);

    // Check if we need to create summaries
    const summaryNeeds = conversationContextManager.shouldCreateSummary(messageCount);
    if (summaryNeeds.brief) {
      console.log(`📝 Creating brief summary for messages ${messageCount - 9}-${messageCount}`);
      // Create summary after API call to avoid delaying response
      setTimeout(() => {
        conversationContextManager.createBriefSummary(this.userId, messageCount);
      }, 100);
    }
    if (summaryNeeds.meta) {
      console.log(`📚 Creating meta-summary for first ${messageCount} messages`);
      setTimeout(() => {
        conversationContextManager.createMetaSummary(this.userId, messageCount);
      }, 100);
    }

    // Call API with enhanced context
    const apiUrl = '/api/chat';
    
    console.log('🌐 Making API call with enhanced context system');
    console.log('🔍 Context details:', {
      systemPromptLength: systemPrompt.length,
      familyContext: contextPackage.familyContext ? 'INCLUDED' : 'NONE',
      conversationSummaries: contextPackage.conversationSummaries.length,
      recentMessages: contextPackage.recentMessages.length
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        systemPrompt: systemPrompt, // Enhanced system prompt with full context
        childContext: contextPackage.familyContext, // Family information
        recentContext: contextPackage.recentMessages, // Recent messages only
        messageCount: messageCount,
        userId: this.userId,
        isPremium: subscriptionService.hasPremiumAccess()
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
    console.log('✅ Enhanced context AI response received');
    
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

  // Get total message count for context management
  async getMessageCount(): Promise<number> {
    const messages = await localStorage.getMessages(this.userId);
    return messages.length;
  }

  async loadConversationHistory(): Promise<Message[]> {
    const messages = await this.getMessageHistory(200);
    
    if (messages.length === 0) {
      // Return guided discovery welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hi! I'm Senali, and I'm here to support you and your family. I'd love to get to know your family better. Can you tell me a bit about yourself - are you a parent or caregiver?",
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

  // Create family profile from discovered information
  private async createFamilyProfile(name: string, age?: number, relationship: 'self' | 'spouse' | 'child' | 'other' = 'child'): Promise<void> {
    try {
      console.log(`🔄 Attempting to create profile for ${name} (${relationship})`);
      
      // Check if profile already exists
      const existing = await localStorage.getChildProfile(this.userId, name);
      if (existing) {
        console.log(`👤 Profile for ${name} already exists, skipping creation`);
        return;
      }

      // Create new profile with minimal required fields based on ChildProfile interface
      const profile = {
        childName: name,
        age: age ? age.toString() : undefined,
        userId: this.userId,
        relationshipToUser: relationship
      };
      
      console.log(`📝 Creating profile with data:`, profile);
      const savedProfile = await localStorage.saveChildProfile(profile);
      console.log(`✅ Successfully created family profile: ${name} (${relationship})`);
      console.log(`✅ Profile saved with ID: ${savedProfile.id}`);
      
      // Verify the profile was saved by reading it back
      const verification = await localStorage.getChildProfile(this.userId, name);
      if (verification) {
        console.log(`✅ Profile verification successful: ${verification.childName}`);
      } else {
        console.error(`❌ Profile verification failed: could not retrieve ${name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating profile for ${name}:`, error);
      console.error(`❌ Error details:`, error instanceof Error ? error.message : 'Unknown error');
      console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    }
  }
}

export const localChatService = new LocalChatService();