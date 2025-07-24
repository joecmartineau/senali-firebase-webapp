/**
 * Subscription Service for App Store and Play Store In-App Purchases
 * 
 * This service handles subscription status and premium feature access
 * for mobile app deployment on iOS App Store and Google Play Store.
 */

export interface SubscriptionStatus {
  isActive: boolean;
  isTrialActive: boolean;
  planType: 'free' | 'monthly' | 'yearly';
  expiresAt?: Date;
  trialEndsAt?: Date;
}

export class SubscriptionService {
  private static instance: SubscriptionService;
  private subscriptionStatus: SubscriptionStatus = {
    isActive: false,
    isTrialActive: false,
    planType: 'free'
  };

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Initialize subscription service and check current status
   */
  async initialize(): Promise<void> {
    // For web development, use local storage to simulate subscription
    // In mobile app, this will integrate with App Store/Play Store APIs
    const storedStatus = localStorage.getItem('senali_subscription_status');
    if (storedStatus) {
      this.subscriptionStatus = JSON.parse(storedStatus);
    }

    // Check if trial has expired
    if (this.subscriptionStatus.isTrialActive && this.subscriptionStatus.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(this.subscriptionStatus.trialEndsAt);
      if (now > trialEnd) {
        this.subscriptionStatus.isTrialActive = false;
        this.subscriptionStatus.planType = 'free';
        this.saveStatus();
      }
    }
  }

  /**
   * Get current subscription status
   */
  getStatus(): SubscriptionStatus {
    return { ...this.subscriptionStatus };
  }

  /**
   * Check if user has premium access (active subscription or trial)
   */
  hasPremiumAccess(): boolean {
    return this.subscriptionStatus.isActive || this.subscriptionStatus.isTrialActive;
  }

  /**
   * Start free trial (7 days)
   */
  startFreeTrial(): void {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    this.subscriptionStatus = {
      isActive: false,
      isTrialActive: true,
      planType: 'free',
      trialEndsAt: trialEnd
    };

    this.saveStatus();
  }

  /**
   * Activate subscription (called after successful App Store purchase)
   */
  activateSubscription(planType: 'monthly' | 'yearly'): void {
    const expiresAt = new Date();
    if (planType === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    this.subscriptionStatus = {
      isActive: true,
      isTrialActive: false,
      planType,
      expiresAt
    };

    this.saveStatus();
  }

  /**
   * Get days remaining in trial or subscription
   */
  getDaysRemaining(): number {
    const now = new Date();
    let endDate: Date | undefined;

    if (this.subscriptionStatus.isTrialActive && this.subscriptionStatus.trialEndsAt) {
      endDate = new Date(this.subscriptionStatus.trialEndsAt);
    } else if (this.subscriptionStatus.isActive && this.subscriptionStatus.expiresAt) {
      endDate = new Date(this.subscriptionStatus.expiresAt);
    }

    if (!endDate) return 0;

    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Reset to free tier (for testing)
   */
  resetToFree(): void {
    this.subscriptionStatus = {
      isActive: false,
      isTrialActive: false,
      planType: 'free'
    };
    this.saveStatus();
  }

  /**
   * Get total trial message count (lifetime limit of 25)
   */
  getTrialMessageCount(): number {
    const messageData = localStorage.getItem('senali_trial_messages');
    
    if (messageData) {
      const data = JSON.parse(messageData);
      return data.count || 0;
    }
    
    return 0;
  }

  /**
   * Increment trial message count
   */
  incrementTrialMessageCount(): void {
    const currentCount = this.getTrialMessageCount();
    
    const messageData = {
      count: currentCount + 1,
      lastUsed: new Date().toISOString()
    };
    
    localStorage.setItem('senali_trial_messages', JSON.stringify(messageData));
  }

  /**
   * Check if user can send another message
   */
  canSendMessage(): boolean {
    if (this.hasPremiumAccess()) {
      return true;
    }
    
    // For free users, check if they have trial messages remaining
    return this.getTrialMessageCount() < SUBSCRIPTION_LIMITS.free.trialMessages;
  }

  /**
   * Get remaining trial messages
   */
  getRemainingTrialMessages(): number {
    const used = this.getTrialMessageCount();
    return Math.max(0, SUBSCRIPTION_LIMITS.free.trialMessages - used);
  }

  private saveStatus(): void {
    localStorage.setItem('senali_subscription_status', JSON.stringify(this.subscriptionStatus));
  }
}

// Premium feature limits for trial vs premium users
export const SUBSCRIPTION_LIMITS = {
  free: {
    trialMessages: 25, // One-time trial limit
    childProfiles: 1,
    exportData: false,
    prioritySupport: false,
    advancedTips: false
  },
  premium: {
    trialMessages: -1, // unlimited
    childProfiles: -1, // unlimited
    exportData: true,
    prioritySupport: true,
    advancedTips: true
  }
};

export const subscriptionService = SubscriptionService.getInstance();