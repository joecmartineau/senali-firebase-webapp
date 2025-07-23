import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ChatMessage {
  id?: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: any;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
}

export interface ChatSession {
  id?: string;
  userId: string;
  title: string;
  createdAt: any;
  updatedAt: any;
  messageCount: number;
  lastMessage?: string;
}

class ChatService {
  private readonly messagesCollection = 'chat_messages';
  private readonly sessionsCollection = 'chat_sessions';

  // Send message and get AI response
  async sendMessage(userId: string, message: string, sessionId?: string): Promise<ChatMessage> {
    try {
      // Save user message
      const userMessage: Omit<ChatMessage, 'id'> = {
        userId,
        content: message,
        role: 'user',
        timestamp: serverTimestamp()
      };

      const userMessageRef = await addDoc(collection(db, this.messagesCollection), userMessage);

      // Get AI response from OpenAI API
      const aiResponse = await this.getAIResponse(userId, message);

      // Save AI response
      const assistantMessage: Omit<ChatMessage, 'id'> = {
        userId,
        content: aiResponse.content,
        role: 'assistant',
        timestamp: serverTimestamp(),
        metadata: aiResponse.metadata
      };

      const assistantMessageRef = await addDoc(collection(db, this.messagesCollection), assistantMessage);

      // Update or create session
      if (sessionId) {
        await this.updateChatSession(sessionId, message);
      } else {
        await this.createChatSession(userId, message);
      }

      return {
        id: assistantMessageRef.id,
        ...assistantMessage
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }

  // Get chat history for user
  async getChatHistory(userId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as ChatMessage);
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw new Error('Failed to load chat history.');
    }
  }

  // Get recent context for AI
  async getRecentContext(userId: string, contextLimit: number = 10): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, this.messagesCollection),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(contextLimit)
      );

      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as ChatMessage);
      });

      return messages.reverse();
    } catch (error) {
      console.error('Error getting recent context:', error);
      return [];
    }
  }

  // Create new chat session
  private async createChatSession(userId: string, firstMessage: string): Promise<string> {
    const session: Omit<ChatSession, 'id'> = {
      userId,
      title: this.generateSessionTitle(firstMessage),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messageCount: 1,
      lastMessage: firstMessage
    };

    const sessionRef = await addDoc(collection(db, this.sessionsCollection), session);
    return sessionRef.id;
  }

  // Update existing chat session
  private async updateChatSession(sessionId: string, lastMessage: string): Promise<void> {
    // This would update the session document
    // Implementation depends on your session tracking needs
  }

  // Generate session title from first message
  private generateSessionTitle(message: string): string {
    const words = message.split(' ').slice(0, 5).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }

  // Get AI response from OpenAI API
  private async getAIResponse(userId: string, message: string): Promise<{
    content: string;
    metadata: ChatMessage['metadata'];
  }> {
    try {
      // Get recent context for the conversation
      const context = await this.getRecentContext(userId, 5);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: context.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      return {
        content: data.response,
        metadata: {
          model: data.model || 'gpt-4o',
          tokens: data.tokens,
          processingTime: data.processingTime
        }
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }
}

export const chatService = new ChatService();
export default chatService;