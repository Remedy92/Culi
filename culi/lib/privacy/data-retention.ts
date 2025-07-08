/**
 * Data retention policies for GDPR compliance
 */

export const DATA_RETENTION_POLICIES = {
  // Default retention periods in days
  conversations: {
    anonymous: 90, // 3 months for anonymous conversations
    authenticated: 365, // 1 year for authenticated users
  },
  
  analytics: {
    free: 30, // 1 month for free tier
    professional: 90, // 3 months for professional
    premium: 365, // 1 year for premium
  },
  
  logs: {
    error: 30, // Keep error logs for 30 days
    access: 7, // Keep access logs for 7 days
  },
  
  exports: {
    userDataExport: 30, // Keep exported data available for 30 days
  },
} as const;

/**
 * Get retention period based on tier and data type
 */
export function getRetentionDays(
  dataType: keyof typeof DATA_RETENTION_POLICIES,
  subType: string,
  tier?: string
): number {
  const policies = DATA_RETENTION_POLICIES[dataType] as any;
  
  if (dataType === 'analytics' && tier) {
    return policies[tier] || policies.free;
  }
  
  return policies[subType] || 90; // Default to 90 days
}

/**
 * Calculate deletion date based on retention policy
 */
export function calculateDeletionDate(
  createdAt: Date,
  retentionDays: number
): Date {
  const deletionDate = new Date(createdAt);
  deletionDate.setDate(deletionDate.getDate() + retentionDays);
  return deletionDate;
}

/**
 * Check if data should be deleted based on retention policy
 */
export function shouldDelete(
  createdAt: Date,
  retentionDays: number
): boolean {
  const deletionDate = calculateDeletionDate(createdAt, retentionDays);
  return new Date() > deletionDate;
}

/**
 * Format retention policy for display
 */
export function formatRetentionPolicy(days: number): string {
  if (days === 365) return '1 year';
  if (days === 90) return '3 months';
  if (days === 30) return '1 month';
  if (days === 7) return '1 week';
  return `${days} days`;
}

/**
 * Get all applicable retention policies for a restaurant
 */
export function getRestaurantRetentionPolicies(tier: string) {
  return {
    conversations: {
      period: DATA_RETENTION_POLICIES.conversations.anonymous,
      description: `Guest conversations are retained for ${formatRetentionPolicy(
        DATA_RETENTION_POLICIES.conversations.anonymous
      )}`,
    },
    analytics: {
      period: DATA_RETENTION_POLICIES.analytics[tier as keyof typeof DATA_RETENTION_POLICIES.analytics] || DATA_RETENTION_POLICIES.analytics.free,
      description: `Analytics data is retained for ${formatRetentionPolicy(
        DATA_RETENTION_POLICIES.analytics[tier as keyof typeof DATA_RETENTION_POLICIES.analytics] || DATA_RETENTION_POLICIES.analytics.free
      )}`,
    },
    exports: {
      period: DATA_RETENTION_POLICIES.exports.userDataExport,
      description: `Data exports are available for ${formatRetentionPolicy(
        DATA_RETENTION_POLICIES.exports.userDataExport
      )}`,
    },
  };
}