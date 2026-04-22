import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { asyncStorage } from './storage';
import { pullMarketplaceProducts } from '@/lib/syncService';

export type ProductCategory =
  | 'bank-accounts'
  | 'credit-cards'
  | 'loans'
  | 'investments'
  | 'insurance'
  | 'mobile-wallets'
  | 'fintech-apps';

export type CardTier = 'strong' | 'moderate' | 'high';

export interface CreditCardProduct {
  id: string;
  bank: string;
  logo: string;
  name: string;
  apr: number;
  annualFee: number;
  cashback: number;
  rating: number;
  reviewsCount: number;
  tier: CardTier;
  minIncome: number;
  minAge?: number;
  minCreditScore?: number;
  benefits: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  isBestValue?: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  createdAt: number;
  helpful: number;
}

export type ApplicationStatus =
  | 'submitted'
  | 'docs_verified'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface Application {
  id: string;
  productId: string;
  productName: string;
  bankName: string;
  bankLogo: string;
  status: ApplicationStatus;
  submittedAt: number;
  decidedAt: number | null;
}

interface MarketplaceState {
  products: CreditCardProduct[];
  reviews: ProductReview[];
  applications: Application[];
  selectedForCompare: string[];
  comparisonsMade: number;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError: string | null;

  /** Selection for compare flow (max 5). */
  toggleCompareSelection: (id: string) => void;
  clearCompareSelection: () => void;

  /** Apply for a credit card. Returns app id. */
  submitApplication: (productId: string) => string;

  /** Advance an application's status by one step (simulated). */
  advanceApplication: (applicationId: string) => void;

  /** Add a review to a product. */
  addReview: (
    productId: string,
    rating: number,
    comment: string,
    user?: string
  ) => void;

  /** Mark a review helpful. */
  markReviewHelpful: (reviewId: string) => void;

  /** Track that a compare flow was completed. */
  trackComparison: () => void;

  getProduct: (id: string) => CreditCardProduct | undefined;
  getReviewsFor: (productId: string) => ProductReview[];
  getApplicationFor: (productId: string) => Application | undefined;

  /** Pull latest marketplace products from Supabase (public read). */
  syncFromCloud: () => Promise<void>;
}

const SEED_PRODUCTS: CreditCardProduct[] = [
  {
    id: 'cib-smart',
    bank: 'CIB',
    logo: '🏦',
    name: 'CIB Smart Credit Card',
    apr: 30,
    annualFee: 300,
    cashback: 2,
    rating: 4.5,
    reviewsCount: 124,
    tier: 'strong',
    minIncome: 5000,
    minAge: 21,
    minCreditScore: 650,
    benefits: ['Airport lounge', 'Cashback', 'Travel insurance'],
    pros: [
      '2% cashback on all purchases',
      'Airport lounge access',
      'Travel insurance included',
      'No foreign transaction fees',
    ],
    cons: ['Annual fee of EGP 300', 'APR higher than market average'],
    bestFor: 'Regular spenders with travel needs',
    isBestValue: true,
  },
  {
    id: 'nbe-platinum',
    bank: 'NBE',
    logo: '🏛️',
    name: 'NBE Platinum Card',
    apr: 35,
    annualFee: 500,
    cashback: 1.5,
    rating: 4.2,
    reviewsCount: 87,
    tier: 'moderate',
    minIncome: 8000,
    minAge: 25,
    minCreditScore: 700,
    benefits: ['Reward points', 'Purchase protection'],
    pros: ['Premium rewards program', 'Purchase protection up to EGP 50k'],
    cons: ['High annual fee', 'High APR', 'High income requirement'],
    bestFor: 'High earners seeking premium perks',
  },
  {
    id: 'misr-gold',
    bank: 'Banque Misr',
    logo: '🏢',
    name: 'Misr Gold Card',
    apr: 32,
    annualFee: 250,
    cashback: 1,
    rating: 4.0,
    reviewsCount: 56,
    tier: 'strong',
    minIncome: 4000,
    minAge: 21,
    minCreditScore: 620,
    benefits: ['Free ATM withdrawals', 'Balance transfer'],
    pros: ['Free ATM at any bank', 'Low annual fee', 'Balance transfer option'],
    cons: ['Limited rewards', 'No travel perks'],
    bestFor: 'Everyday banking essentials',
  },
  {
    id: 'hsbc-premier',
    bank: 'HSBC',
    logo: '🏪',
    name: 'HSBC Premier Card',
    apr: 42,
    annualFee: 800,
    cashback: 3,
    rating: 4.8,
    reviewsCount: 203,
    tier: 'high',
    minIncome: 15000,
    minAge: 28,
    minCreditScore: 750,
    benefits: ['Concierge service', 'Priority banking', 'Global coverage'],
    pros: [
      '3% cashback on all spend',
      '24/7 concierge service',
      'Global lounge access',
      'Priority banking queue',
    ],
    cons: [
      'Very high annual fee',
      'Highest APR on market',
      'Strict eligibility',
    ],
    bestFor: 'Executives with global lifestyle',
  },
  {
    id: 'alex-student',
    bank: 'Alex Bank',
    logo: '🏬',
    name: 'Alex Student Card',
    apr: 28,
    annualFee: 0,
    cashback: 0.5,
    rating: 3.8,
    reviewsCount: 41,
    tier: 'strong',
    minIncome: 0,
    minAge: 18,
    minCreditScore: 0,
    benefits: ['No annual fee', 'Student discounts'],
    pros: [
      'Zero annual fee',
      'No minimum income',
      'Student discount partners',
      'Lowest APR',
    ],
    cons: ['Very low cashback', 'No premium perks'],
    bestFor: 'Students & first-time users',
  },
];

const SEED_REVIEWS: ProductReview[] = [
  {
    id: 'r1',
    productId: 'cib-smart',
    user: 'Ahmed M.',
    avatar: '👨',
    rating: 5,
    comment:
      'Great card with excellent cashback rewards. Customer service is responsive.',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    helpful: 24,
  },
  {
    id: 'r2',
    productId: 'cib-smart',
    user: 'Sarah K.',
    avatar: '👩',
    rating: 4,
    comment:
      'Good benefits but APR is a bit high. Overall satisfied with the service.',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    helpful: 18,
  },
  {
    id: 'r3',
    productId: 'cib-smart',
    user: 'Mohamed S.',
    avatar: '🧑',
    rating: 5,
    comment: 'Airport lounge access is amazing! Worth the annual fee.',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    helpful: 31,
  },
  {
    id: 'r4',
    productId: 'alex-student',
    user: 'Laila T.',
    avatar: '👩‍🎓',
    rating: 4,
    comment: 'Perfect for my university years. Zero fees, low stress.',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    helpful: 12,
  },
  {
    id: 'r5',
    productId: 'hsbc-premier',
    user: 'Omar F.',
    avatar: '👔',
    rating: 5,
    comment: 'Concierge saved my trip twice. Worth every pound of the fee.',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    helpful: 42,
  },
];

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      products: SEED_PRODUCTS,
      reviews: SEED_REVIEWS,
      applications: [],
      selectedForCompare: [],
      comparisonsMade: 0,
      syncStatus: 'idle',
      syncError: null,

      syncFromCloud: async () => {
        set({ syncStatus: 'syncing', syncError: null });
        try {
          const remote = await pullMarketplaceProducts('credit-cards');
          if (remote.length) {
            const mapped: CreditCardProduct[] = remote.map((r) => ({
              id: r.id,
              bank: r.bank,
              logo: r.logo,
              name: r.name,
              apr: Number(r.apr) || 0,
              annualFee: Number(r.annual_fee) || 0,
              cashback: Number(r.cashback) || 0,
              rating: Number(r.rating) || 0,
              reviewsCount: Number(r.reviews_count) || 0,
              tier: r.tier,
              minIncome: Number(r.min_income) || 0,
              minAge: r.min_age ?? undefined,
              minCreditScore: r.min_credit_score ?? undefined,
              benefits: r.benefits ?? [],
              pros: r.pros ?? [],
              cons: r.cons ?? [],
              bestFor: r.best_for ?? '',
              isBestValue: !!r.is_best_value,
            }));
            set({ products: mapped, syncStatus: 'success', syncError: null });
            return;
          }
          set({ syncStatus: 'success', syncError: null });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          set({ syncStatus: 'error', syncError: message });
        }
      },

      toggleCompareSelection: (id) => {
        set((state) => {
          if (state.selectedForCompare.includes(id)) {
            return {
              selectedForCompare: state.selectedForCompare.filter(
                (pid) => pid !== id
              ),
            };
          }
          if (state.selectedForCompare.length >= 5) return state;
          return {
            selectedForCompare: [...state.selectedForCompare, id],
          };
        });
      },

      clearCompareSelection: () => set({ selectedForCompare: [] }),

      submitApplication: (productId) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return '';
        const id = makeId('app');
        const application: Application = {
          id,
          productId,
          productName: product.name,
          bankName: product.bank,
          bankLogo: product.logo,
          status: 'submitted',
          submittedAt: Date.now(),
          decidedAt: null,
        };
        set((state) => ({
          applications: [application, ...state.applications],
        }));
        return id;
      },

      advanceApplication: (applicationId) => {
        const flow: ApplicationStatus[] = [
          'submitted',
          'docs_verified',
          'under_review',
          'approved',
        ];
        set((state) => ({
          applications: state.applications.map((app) => {
            if (app.id !== applicationId) return app;
            const idx = flow.indexOf(app.status);
            if (idx < 0 || idx === flow.length - 1) return app;
            const next = flow[idx + 1];
            return {
              ...app,
              status: next,
              decidedAt:
                next === 'approved' || next === 'rejected' ? Date.now() : null,
            };
          }),
        }));
      },

      addReview: (productId, rating, comment, user = 'You') => {
        const review: ProductReview = {
          id: makeId('r'),
          productId,
          user,
          avatar: '🙂',
          rating,
          comment,
          createdAt: Date.now(),
          helpful: 0,
        };
        set((state) => ({
          reviews: [review, ...state.reviews],
          products: state.products.map((p) => {
            if (p.id !== productId) return p;
            const count = p.reviewsCount + 1;
            const avg =
              (p.rating * p.reviewsCount + rating) / Math.max(count, 1);
            return {
              ...p,
              reviewsCount: count,
              rating: Math.round(avg * 10) / 10,
            };
          }),
        }));
      },

      markReviewHelpful: (reviewId) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
          ),
        }));
      },

      trackComparison: () => {
        set((state) => ({ comparisonsMade: state.comparisonsMade + 1 }));
      },

      getProduct: (id) => get().products.find((p) => p.id === id),
      getReviewsFor: (productId) =>
        get().reviews.filter((r) => r.productId === productId),
      getApplicationFor: (productId) =>
        get().applications.find((a) => a.productId === productId),
    }),
    {
      name: 'fin-game/marketplace',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        applications: state.applications,
        comparisonsMade: state.comparisonsMade,
      }),
    }
  )
);

export const MARKETPLACE_CATEGORIES: {
  id: ProductCategory;
  title: string;
  description: string;
  icon: string;
  color: [string, string];
  count: number;
}[] = [
  {
    id: 'bank-accounts',
    title: 'Bank Accounts',
    description: 'Compare savings & current accounts',
    icon: 'Building2',
    color: ['#3b82f6', '#2563eb'],
    count: 24,
  },
  {
    id: 'credit-cards',
    title: 'Credit Cards',
    description: 'Find the best card for you',
    icon: 'CreditCard',
    color: ['#a855f7', '#9333ea'],
    count: 18,
  },
  {
    id: 'loans',
    title: 'Loans',
    description: 'Personal, car & home loans',
    icon: 'DollarSign',
    color: ['#22c55e', '#16a34a'],
    count: 32,
  },
  {
    id: 'investments',
    title: 'Investment Products',
    description: 'Mutual funds & certificates',
    icon: 'TrendingUp',
    color: ['#f97316', '#ea580c'],
    count: 15,
  },
  {
    id: 'insurance',
    title: 'Insurance',
    description: 'Life, health & auto coverage',
    icon: 'Shield',
    color: ['#ef4444', '#dc2626'],
    count: 21,
  },
  {
    id: 'mobile-wallets',
    title: 'Mobile Wallets',
    description: 'Digital payment solutions',
    icon: 'Smartphone',
    color: ['#6366f1', '#4f46e5'],
    count: 12,
  },
  {
    id: 'fintech-apps',
    title: 'Fintech Apps',
    description: 'Modern financial services',
    icon: 'Wallet',
    color: ['#eab308', '#ca8a04'],
    count: 9,
  },
];
