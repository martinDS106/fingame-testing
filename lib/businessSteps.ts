import type { BusinessStepId } from '@/stores';

export interface BusinessStepOption {
  id: string;
  label: string;
  description: string;
  impactOnCash: number;
  impactOnReputation: number;
}

export interface BusinessStepConfig {
  id: BusinessStepId;
  emoji: string;
  question: string;
  options: BusinessStepOption[];
}

export const BUSINESS_STEP_CONFIGS: Record<BusinessStepId, BusinessStepConfig> =
  {
    idea: {
      id: 'idea',
      emoji: '💡',
      question: 'What kind of business do you want to start?',
      options: [
        {
          id: 'coffee',
          label: 'Specialty Coffee Shop',
          description: 'Higher upfront cost, loyal customer base',
          impactOnCash: -3000,
          impactOnReputation: 8,
        },
        {
          id: 'ecommerce',
          label: 'Online Store',
          description: 'Low overhead, tough competition',
          impactOnCash: -800,
          impactOnReputation: 4,
        },
        {
          id: 'services',
          label: 'Freelance Services',
          description: 'Minimal cost, reputation grows slowly',
          impactOnCash: -300,
          impactOnReputation: 2,
        },
      ],
    },
    market_research: {
      id: 'market_research',
      emoji: '🔍',
      question: 'How will you research your market?',
      options: [
        {
          id: 'agency',
          label: 'Hire a Market Research Agency',
          description: 'Pro data, but expensive',
          impactOnCash: -4500,
          impactOnReputation: 10,
        },
        {
          id: 'diy_surveys',
          label: 'Run Surveys Yourself',
          description: 'Cheap, takes more time',
          impactOnCash: -600,
          impactOnReputation: 5,
        },
        {
          id: 'gut_feeling',
          label: 'Skip research, trust your gut',
          description: 'Saves money, risky',
          impactOnCash: 0,
          impactOnReputation: -8,
        },
      ],
    },
    business_plan: {
      id: 'business_plan',
      emoji: '📋',
      question: 'Build your business plan:',
      options: [
        {
          id: 'detailed',
          label: 'Detailed 3-year Plan',
          description: 'Consulting help included',
          impactOnCash: -2000,
          impactOnReputation: 10,
        },
        {
          id: 'lean',
          label: 'Lean 1-page Plan',
          description: 'Fast and flexible',
          impactOnCash: -200,
          impactOnReputation: 5,
        },
      ],
    },
    legal_setup: {
      id: 'legal_setup',
      emoji: '⚖️',
      question: 'Legal structure?',
      options: [
        {
          id: 'llc',
          label: 'Register LLC',
          description: 'Protect personal assets',
          impactOnCash: -3500,
          impactOnReputation: 8,
        },
        {
          id: 'sole',
          label: 'Sole Proprietor',
          description: 'Cheaper and simpler',
          impactOnCash: -500,
          impactOnReputation: 3,
        },
        {
          id: 'skip',
          label: 'Skip registration for now',
          description: 'Saves cash, risky',
          impactOnCash: 0,
          impactOnReputation: -12,
        },
      ],
    },
    funding: {
      id: 'funding',
      emoji: '💰',
      question: 'How will you fund the business?',
      options: [
        {
          id: 'bootstrap',
          label: 'Bootstrap with Savings',
          description: 'No debt, limited runway',
          impactOnCash: 5000,
          impactOnReputation: 2,
        },
        {
          id: 'loan',
          label: 'Bank Loan (EGP 20k)',
          description: 'Grow faster, pay interest',
          impactOnCash: 20000,
          impactOnReputation: -2,
        },
        {
          id: 'investor',
          label: 'Angel Investor',
          description: 'Capital + mentorship, give up equity',
          impactOnCash: 30000,
          impactOnReputation: 8,
        },
      ],
    },
    location: {
      id: 'location',
      emoji: '📍',
      question: 'Pick a location:',
      options: [
        {
          id: 'premium',
          label: 'Premium Street Location',
          description: 'High foot traffic, expensive rent',
          impactOnCash: -8000,
          impactOnReputation: 12,
        },
        {
          id: 'suburb',
          label: 'Suburb Location',
          description: 'Balanced cost and traffic',
          impactOnCash: -3000,
          impactOnReputation: 5,
        },
        {
          id: 'online',
          label: 'Online Only',
          description: 'Zero rent, no walk-ins',
          impactOnCash: -500,
          impactOnReputation: 2,
        },
      ],
    },
    hiring: {
      id: 'hiring',
      emoji: '👥',
      question: 'Who do you hire first?',
      options: [
        {
          id: 'team',
          label: 'Small Team (3 people)',
          description: 'Faster execution, higher payroll',
          impactOnCash: -6000,
          impactOnReputation: 8,
        },
        {
          id: 'one',
          label: 'One Key Hire',
          description: 'Balanced start',
          impactOnCash: -2500,
          impactOnReputation: 5,
        },
        {
          id: 'solo',
          label: 'Go Solo for Now',
          description: 'Save cash, slower growth',
          impactOnCash: 0,
          impactOnReputation: -2,
        },
      ],
    },
    marketing: {
      id: 'marketing',
      emoji: '📣',
      question: 'Marketing strategy:',
      options: [
        {
          id: 'campaign',
          label: 'Paid Ads Campaign',
          description: 'Quick reach, costs money',
          impactOnCash: -4000,
          impactOnReputation: 10,
        },
        {
          id: 'social',
          label: 'Organic Social Media',
          description: 'Slow but sustainable',
          impactOnCash: -500,
          impactOnReputation: 6,
        },
        {
          id: 'influencer',
          label: 'Influencer Partnership',
          description: 'Big spike if it lands',
          impactOnCash: -2500,
          impactOnReputation: 12,
        },
      ],
    },
    launch: {
      id: 'launch',
      emoji: '🚀',
      question: 'Launch plan:',
      options: [
        {
          id: 'event',
          label: 'Grand Opening Event',
          description: 'Expensive, memorable',
          impactOnCash: -3000,
          impactOnReputation: 15,
        },
        {
          id: 'soft',
          label: 'Soft Launch',
          description: 'Collect feedback quietly',
          impactOnCash: -500,
          impactOnReputation: 5,
        },
      ],
    },
    scale: {
      id: 'scale',
      emoji: '📈',
      question: 'How do you scale?',
      options: [
        {
          id: 'second_location',
          label: 'Open Second Location',
          description: 'Big investment, big upside',
          impactOnCash: -15000,
          impactOnReputation: 18,
        },
        {
          id: 'online_expand',
          label: 'Expand to E-commerce',
          description: 'Lower cost, new audience',
          impactOnCash: -4000,
          impactOnReputation: 10,
        },
        {
          id: 'optimize',
          label: 'Optimize Operations',
          description: 'Improve margins first',
          impactOnCash: -1500,
          impactOnReputation: 6,
        },
      ],
    },
  };
