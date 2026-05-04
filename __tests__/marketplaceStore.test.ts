import { useMarketplaceStore } from '@/stores/useMarketplaceStore';

jest.mock('@/lib/syncServiceApi', () => ({
  pullMarketplaceProducts: jest.fn(async () => [
    {
      id: 'x1',
      category: 'credit-cards',
      bank: 'TestBank',
      logo: '🏦',
      name: 'Test Card',
      apr: 31,
      annual_fee: 123,
      cashback: 2.5,
      rating: 4.1,
      reviews_count: 9,
      tier: 'strong',
      min_income: 5000,
      min_age: 21,
      min_credit_score: 650,
      benefits: ['A', 'B'],
      pros: ['P1'],
      cons: ['C1'],
      best_for: 'Testing',
      is_best_value: true,
      sort_order: 1,
    },
  ]),
}));

describe('useMarketplaceStore', () => {
  beforeEach(() => {
    useMarketplaceStore.setState({
      products: [],
      reviews: [],
      applications: [],
      selectedForCompare: [],
      comparisonsMade: 0,
      syncStatus: 'idle',
      syncError: null,
    } as any);
  });

  test('syncFromCloud maps remote fields to local shape', async () => {
    await useMarketplaceStore.getState().syncFromCloud();
    const s = useMarketplaceStore.getState();
    expect(s.syncStatus).toBe('success');
    expect(s.products.length).toBe(1);
    expect(s.products[0]).toEqual(
      expect.objectContaining({
        id: 'x1',
        bank: 'TestBank',
        annualFee: 123,
        reviewsCount: 9,
        minIncome: 5000,
        isBestValue: true,
        benefits: ['A', 'B'],
      })
    );
  });
});

