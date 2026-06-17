const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getApiKey(): string {
  return localStorage.getItem('merchantApiKey') || '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': getApiKey(),
    ...(options.headers as Record<string, string> || {}),
  };

  const isMutation = options.method !== undefined && options.method.toUpperCase() !== 'GET';
  const timeoutMs = isMutation ? 20000 : 8000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    // 401 means the stored key is dead (rotated, revoked, or a stale legacy
    // UUID after the security migration). Wipe it and bounce to login so the
    // app doesn't loop on a doomed key.
    if (res.status === 401 && getApiKey()) {
      localStorage.removeItem('merchantApiKey');
      // Avoid redirect loop if we're already on /login or /signup
      const onAuthPage = /\/dashboard\/(login|signup)\b/.test(window.location.pathname);
      if (!onAuthPage) {
        window.location.assign('/dashboard/login');
      }
    }
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ---------- Auth ----------

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  plan: string;
  settings: string;
  preferredLocale: 'en' | 'it' | 'es';
  active: boolean;
  createdAt: string;
  cardTemplates?: CardTemplate[];
}

interface AuthResponse {
  merchant: Merchant;
  apiKey: string;
}

export function signup(name: string, email: string, password: string) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMerchant(id: string) {
  return request<Merchant>(`/merchants/${id}`);
}

export function getMerchantMe() {
  return request<Merchant>('/merchants/me');
}

export function updateMerchantMe(data: Record<string, unknown>) {
  return request<Merchant>('/merchants/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getMerchantByEmail(email: string) {
  return request<Merchant>(`/merchants/by-email/${encodeURIComponent(email)}`);
}

// ---------- Loyalty Programs ----------

export interface RewardTier {
  id: string;
  name: string;
  threshold: number;
  rewardName: string;
  sortOrder: number;
}

export interface LoyaltyProgram {
  id: string;
  merchantId: string;
  type: 'POINTS' | 'STAMPS';
  goalStamps: number | null;
  welcomeStamps: number | null;
  welcomePoints: number | null;
  pointsPerCurrency: string | null;
  active: boolean;
  rewardTiers: RewardTier[];
  hasTransactions?: boolean;
}

export interface CreateProgramPayload {
  type: 'POINTS' | 'STAMPS';
  goalStamps?: number;
  welcomeStamps?: number;
  welcomePoints?: number;
  pointsPerCurrency?: number;
  rewardTiers: { name: string; threshold: number; rewardName: string }[];
}

export function createLoyaltyProgram(data: CreateProgramPayload) {
  return request<LoyaltyProgram>('/programs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMyProgram() {
  return request<LoyaltyProgram | null>('/programs/mine');
}

// ---------- Stats ----------

export interface Stats {
  activeCommunity: number;
  newUsers: number;
}

export type InsightsPeriod = '24h' | '7d' | '30d';

export type InsightsRange =
  | { kind: 'preset'; preset: InsightsPeriod }
  | { kind: 'custom'; from: string; to: string };

export const DEFAULT_RANGE: InsightsRange = { kind: 'preset', preset: '7d' };

function rangeToQuery(range: InsightsRange): string {
  if (range.kind === 'custom') {
    const params = new URLSearchParams({ from: range.from, to: range.to });
    return params.toString();
  }
  return `period=${range.preset}`;
}

export interface InsightsKpis {
  activeMembers: number;
  newMembers: number;
  returningCustomers: number;
  reviewsCount: number;
  nearRewardCustomers: number;
  avgRating: number | null;
  retention: number | null;
  trends: {
    activeMembers: number | null;
    newMembers: number | null;
    nearRewardCustomers: number | null;
    avgRating: number | null;
    retention: number | null;
  };
}

export interface FeedbackItem {
  id: string;
  customerName: string;
  rating: number;
  createdAt: string;
  text: string;
  isNew: boolean;
  // Detailed ratings (optional, from review flow)
  foodRating?: number | null;
  serviceRating?: number | null;
  atmosphereRating?: number | null;
  source?: 'DIRECT' | 'GOOGLE_MAPS' | 'OTHER';
}

export interface InsightsSentiment {
  total: number;
  average: number | null;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface InsightsNotification {
  id: string;
  type: 'reward_ready' | 'near_reward' | 'inactive';
  count?: number;
  title: string;
  description: string;
  actionPath: string;
  severity: 'high' | 'medium';
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export async function getInsightsKpis(range: InsightsRange = DEFAULT_RANGE): Promise<InsightsKpis> {
  const raw = await request<Record<string, unknown>>(`/stats?${rangeToQuery(range)}`);
  const rawTrends = (raw.trends ?? {}) as Record<string, unknown>;

  return {
    activeMembers: asNumber(raw.activeMembers ?? raw.activeCommunity),
    newMembers: asNumber(raw.newMembers ?? raw.newUsers),
    returningCustomers: asNumber(raw.returningCustomers),
    reviewsCount: asNumber(raw.reviewsCount),
    nearRewardCustomers: asNumber(raw.nearRewardCustomers),
    avgRating: asNullableNumber(raw.avgRating),
    retention: asNullableNumber(raw.retention),
    trends: {
      activeMembers: asNullableNumber(rawTrends.activeMembers),
      newMembers: asNullableNumber(rawTrends.newMembers),
      nearRewardCustomers: asNullableNumber(rawTrends.nearRewardCustomers),
      avgRating: asNullableNumber(rawTrends.avgRating),
      retention: asNullableNumber(rawTrends.retention),
    },
  };
}

export function getStats(range: InsightsRange = DEFAULT_RANGE): Promise<Stats> {
  return getInsightsKpis(range).then((kpis) => ({
    activeCommunity: kpis.activeMembers,
    newUsers: kpis.newMembers,
  }));
}

export async function getInsightsFeedback(range: InsightsRange = DEFAULT_RANGE, limit = 6): Promise<FeedbackItem[]> {
  const response = await request<{ feedback: FeedbackItem[] }>(
    `/stats/feedback?${rangeToQuery(range)}&limit=${limit}`,
  );
  return response.feedback;
}

export function getInsightsSentiment(range: InsightsRange = DEFAULT_RANGE) {
  return request<InsightsSentiment>(`/stats/sentiment?${rangeToQuery(range)}`);
}

export function getInsightsNotifications() {
  return request<{ notifications: InsightsNotification[] }>('/stats/notifications').then((res) => res.notifications);
}

// ---------- Cards ----------

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
}

export interface MerchantCustomer {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  pointsBalance: number;
  status: string;
  lastVisitAt: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  tier: string;
  pointsPerCurrency: string;
  redemptionRate: string;
  minRedeemPoints: number;
}

export interface LoyaltyCard {
  id: string;
  cardNumber: string;
  merchantId: string;
  customerId: string;
  status: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  issuedAt: string;
  expiresAt: string | null;
  customer: Customer;
  cardTemplate: CardTemplate | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function listCards(page = 1, limit = 20, status?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  return request<PaginatedResponse<LoyaltyCard>>(`/cards?${params}`);
}

export interface ManualAddResult {
  alreadyEnrolled: boolean;
  loyaltyUrl: string;
  emailSent: boolean;
  customer: { id: string; firstName: string; lastName: string; email: string };
}

export function manualAddCustomer(payload: { firstName: string; lastName?: string; email: string }) {
  return request<ManualAddResult>('/customers/manual-add', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listCustomers(page = 1, limit = 20, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set('search', search.trim());
  return request<PaginatedResponse<MerchantCustomer>>(`/customers?${params}`);
}

export function getCard(id: string) {
  return request<LoyaltyCard>(`/cards/${id}`);
}

export function updateCardStatus(id: string, status: string) {
  return request<LoyaltyCard>(`/cards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ---------- Points ----------

export interface PointsTransaction {
  id: string;
  loyaltyCardId: string;
  type: string;
  points: number;
  balanceAfter: number;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface BalanceInfo {
  id: string;
  cardNumber: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  status: string;
}

export function getCardBalance(cardId: string) {
  return request<BalanceInfo>(`/points/balance/${cardId}`);
}

export function getTransactionHistory(cardId: string, page = 1, limit = 20, type?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.set('type', type);
  return request<PaginatedResponse<PointsTransaction>>(`/points/history/${cardId}?${params}`);
}

export function earnPoints(loyaltyCardId: string, points: number, description?: string) {
  return request<{ transaction: PointsTransaction; balance: number }>('/points/earn', {
    method: 'POST',
    body: JSON.stringify({ loyaltyCardId, points, description }),
  });
}

export function redeemPoints(loyaltyCardId: string, points: number, description?: string) {
  return request<{ transaction: PointsTransaction; balance: number }>('/points/redeem', {
    method: 'POST',
    body: JSON.stringify({ loyaltyCardId, points, description }),
  });
}

// ---------- Customer Scan Flow ----------

export interface CustomerCardDetail {
  id: string;
  cardNumber: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  redemptionsCount: number;
  status: string;
  recentTransactions: PointsTransaction[];
  enrolledAt: string;
  program: {
    type: 'POINTS' | 'STAMPS';
    goalStamps: number | null;
    pointsPerCurrency: number | null;
    rewardTiers: Array<{
      id: string;
      name: string;
      rewardName: string;
      threshold: number;
      sortOrder: number;
    }>;
  } | null;
}

export function getCustomerCard(customerId: string) {
  return request<CustomerCardDetail>(`/customers/${customerId}/card`);
}

export interface AddPointsResponse {
  success: boolean;
  transaction: {
    id: string;
    points: number;
    balanceAfter: number;
    createdAt: string;
  };
  card: {
    pointsBalance: number;
    totalEarned: number;
  };
}

export function addPointsToCustomer(customerId: string, points: number, description?: string) {
  return request<AddPointsResponse>(`/customers/${customerId}/points`, {
    method: 'POST',
    body: JSON.stringify({ points, description }),
  });
}

export interface RewardTier {
  id: string;
  name: string;
  rewardName: string;
  threshold: number;
  sortOrder: number;
}

export interface AvailableRewardsResponse {
  availableRewards: RewardTier[];
  allRewards: RewardTier[];
  currentPoints: number;
}

export function getAvailableRewards(customerId: string) {
  return request<AvailableRewardsResponse>(`/customers/${customerId}/available-rewards`);
}

export interface RedeemRewardResponse {
  success: boolean;
  transaction: {
    id: string;
    points: number;
    balanceAfter: number;
    createdAt: string;
  };
  card: {
    pointsBalance: number;
    totalRedeemed: number;
  };
  reward: {
    name: string;
    rewardName: string;
    threshold: number;
  };
}

export function redeemReward(customerId: string, rewardTierId: string) {
  return request<RedeemRewardResponse>(`/customers/${customerId}/redeem`, {
    method: 'POST',
    body: JSON.stringify({ rewardTierId }),
  });
}

// ---------- Wallet Scan ----------

export interface WalletScanResult {
  walletPassId: string;
  loyaltyCardId: string;
  merchantId: string;
  merchantName: string;
  customerId: string;
  customerName: string;
  cardNumber: string;
  pointsBalance: number;
  pointsBalanceDisplay: string;
  tierName: string | null;
  activePrizeCount: number;
  activePrizes: Array<{
    id: string;
    prizeWinId: string;
    name: string;
    prizeType: string;
    expiresAt: string;
    redemptionCode: string;
    campaignId: string;
    campaignName: string;
    wonAt: string;
  }>;
  availableRewards: Array<{
    id: string;
    name: string;
    rewardName: string;
    threshold: number;
    sortOrder: number;
  }>;
  recentHistory: Array<{
    id: string;
    type: "POINTS" | "PRIZE";
    event: string;
    description: string;
    pointsDelta: number | null;
    createdAt: string;
  }>;
  nearestPrizeExpiration: string | null;
  merchantScanToken: string;
  customerAccessToken: string;
}

export function resolveWalletScan(barcodeToken: string) {
  return request<WalletScanResult>('/wallet/scan/resolve', {
    method: 'POST',
    body: JSON.stringify({ barcodeToken }),
  });
}

// ---------- Gamification Campaigns ----------

export type GameType = 'SCRATCH_CARD' | 'SPIN_WHEEL';
export type PrizeType = 'PHYSICAL' | 'DIGITAL';
export type PrizeStatus = 'PENDING' | 'REDEEMED' | 'EXPIRED';

export interface Prize {
  id: string;
  name: string;
  description?: string;
  prizeType: PrizeType;
  prizeValue?: string;
  probability: number;
  validityDays: number;
  imageUrl?: string;
  active: boolean;
}

export interface Campaign {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  gameType: GameType;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  prizes: Prize[];
  _count?: {
    prizeWins: number;
  };
}

export interface CampaignStats {
  campaignId: string;
  campaignName: string;
  totalPlays: number;
  totalRedeemed: number;
  totalExpired: number;
  totalPending: number;
  redemptionRate: number;
  prizeDistribution: Array<{
    prizeName: string;
    prizeType: PrizeType;
    timesWon: number;
    probability: number;
  }>;
}

export interface CreateCampaignPayload {
  name?: string;
  description?: string;
  gameType: GameType;
  startDate?: string;
  endDate?: string;
  prizes: Array<{
    name: string;
    description?: string;
    prizeType: PrizeType;
    prizeValue?: string;
    probability: number;
    validityDays?: number;
    imageUrl?: string;
  }>;
}

export interface UpdateCampaignPayload {
  name?: string;
  description?: string;
  gameType?: GameType;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  prizes?: Array<{
    id?: string;
    name: string;
    description?: string;
    prizeType: PrizeType;
    prizeValue?: string;
    probability: number;
    validityDays?: number;
    imageUrl?: string;
    active?: boolean;
  }>;
}

export function listCampaigns() {
  return request<Campaign[]>('/campaigns');
}

export function getCampaign(id: string) {
  return request<Campaign>(`/campaigns/${id}`);
}

export function createCampaign(data: CreateCampaignPayload) {
  return request<Campaign>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCampaign(id: string, data: UpdateCampaignPayload) {
  return request<Campaign>(`/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteCampaign(id: string) {
  return request<{ success: boolean }>(`/campaigns/${id}`, {
    method: 'DELETE',
  });
}

export function getCampaignStats(id: string) {
  return request<CampaignStats>(`/campaigns/${id}/stats`);
}

export function redeemPrize(campaignId: string, redemptionCode: string) {
  return request<{
    success: boolean;
    customerName: string;
    prizeName: string;
    redeemedAt: string;
  }>(`/campaigns/${campaignId}/redeem`, {
    method: 'POST',
    body: JSON.stringify({ redemptionCode }),
  });
}
