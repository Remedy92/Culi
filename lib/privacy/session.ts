import { createHash } from 'crypto';

/**
 * GDPR-compliant session tracking utilities
 */

interface SessionData {
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AnonymizedSession {
  sessionHash: string;
  ipCountry?: string;
  ipRegion?: string;
  userAgentHash?: string;
}

/**
 * Generate a unique session ID for anonymous users
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Hash session ID with daily salt for privacy
 * In production, the salt should come from the database
 */
export function hashSessionId(sessionId: string, dailySalt: string): string {
  return createHash('sha256')
    .update(sessionId + dailySalt)
    .digest('hex');
}

/**
 * Anonymize IP address by keeping only first 3 octets
 * IPv4: 192.168.1.123 -> 192.168.1.0
 * IPv6: Keeps only the first 48 bits (first 3 segments)
 */
export function anonymizeIpAddress(ip: string): string {
  if (!ip) return '';
  
  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  
  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    // Keep first 3 segments (48 bits) for IPv6
    return `${parts.slice(0, 3).join(':')}::`;
  }
  
  return ''; // Invalid format
}

/**
 * Hash user agent for privacy while maintaining uniqueness
 */
export function hashUserAgent(userAgent: string): string {
  if (!userAgent) return '';
  return createHash('sha256')
    .update(userAgent)
    .digest('hex')
    .substring(0, 16); // Keep first 16 chars for storage efficiency
}

/**
 * Extract country and region from IP using a geo service
 * This is a placeholder - in production, use a service like MaxMind
 */
export async function getGeoFromIp(ip: string): Promise<{ country?: string; region?: string }> {
  // TODO: Implement with actual geo service
  // For now, return empty data
  return { country: undefined, region: undefined };
}

/**
 * Create an anonymized session object that's GDPR compliant
 */
export async function createAnonymizedSession(
  data: SessionData,
  dailySalt: string
): Promise<AnonymizedSession> {
  const sessionHash = hashSessionId(data.sessionId, dailySalt);
  const userAgentHash = data.userAgent ? hashUserAgent(data.userAgent) : undefined;
  
  let ipCountry: string | undefined;
  let ipRegion: string | undefined;
  
  if (data.ipAddress) {
    const geo = await getGeoFromIp(data.ipAddress);
    ipCountry = geo.country;
    ipRegion = geo.region;
  }
  
  return {
    sessionHash,
    ipCountry,
    ipRegion,
    userAgentHash,
  };
}

/**
 * Get or create session ID from cookies
 */
export function getOrCreateSessionId(cookies: { [key: string]: string }): string {
  const existingId = cookies['culi_session'];
  if (existingId) {
    return existingId;
  }
  return generateSessionId();
}

/**
 * Calculate session expiry (default 24 hours)
 */
export function getSessionExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

/**
 * Check if consent is given for analytics
 */
export function hasAnalyticsConsent(cookies: { [key: string]: string }): boolean {
  return cookies['culi_consent'] === 'analytics' || cookies['culi_consent'] === 'all';
}

/**
 * Check if consent is given for functional cookies
 */
export function hasFunctionalConsent(cookies: { [key: string]: string }): boolean {
  return cookies['culi_consent'] === 'functional' || cookies['culi_consent'] === 'all';
}