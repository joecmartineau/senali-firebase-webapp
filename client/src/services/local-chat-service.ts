import { localStorage, type ChildProfile } from '../lib/local-storage';
import { localAssessmentProcessor } from '../lib/local-assessment-processor';
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

    // Process message for profile and symptom updates locally
    try {
      await localAssessmentProcessor.processMessageEfficient(this.userId, content);
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

    // Extract and create family members from current message
    const recentMessages = await this.getMessageHistory(3);
    const messageCount = recentMessages.length + 1;
    const existingProfiles = await localStorage.getChildProfiles(this.userId);
    
    // Get guided family discovery prompt for current message count
    const systemPrompt = getFamilyDiscoveryPrompt(messageCount, existingProfiles);
    
    // Extract and create family members from current message (only if in first 10 messages or explicit request)
    if (messageCount <= 10) {
      const newMembers = extractFamilyMembers(content);
      for (const member of newMembers) {
        await this.createFamilyProfile(member.name, member.age, member.relationship);
        console.log(`👶 Auto-created profile for ${member.name} (${member.relationship}) in discovery phase`);
      }
    }
    
    // Call API for AI response with guided discovery context
    const apiUrl = '/api/chat';
    
    console.log('🌐 Making API call to:', apiUrl);
    console.log('📝 Request data - Message count:', messageCount, 'Family members:', newMembers.length);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        systemPrompt: systemPrompt, // Include guided discovery prompt
        childContext: childContext, // Include context for personalized responses
        recentContext: recentMessages.slice(-3).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
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
      // Check if profile already exists
      const existing = await localStorage.getChildProfile(this.userId, name);
      if (existing) {
        console.log(`👤 Profile for ${name} already exists, skipping creation`);
        return;
      }

      // Create new profile (simplified to avoid type issues)
      const profile = {
        childName: name,
        age: age ? age.toString() : undefined,
        userId: this.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        symptomTracking: {},
        relationship: relationship
      };
      
      await localStorage.saveChildProfile(profile);

      console.log(`✅ Created new family profile: ${name} (${relationship})`);
    } catch (error) {
      console.error(`Error creating profile for ${name}:`, error);
    }
  }
}

export const localChatService = new LocalChatService();