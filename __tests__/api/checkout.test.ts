import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { POST } from '@/app/api/checkout/route';
import { NextRequest } from 'next/server';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

describe('Checkout API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://store.paing.xyz';
  });

  it('should return error if Stripe is not configured', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    
    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'test-id',
        templateSlug: 'test-slug',
        templateTitle: 'Test Template',
        price: 99,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Stripe is not configured');
  });

  it('should return error if required fields are missing', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
    
    const request = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        templateId: 'test-id',
        // Missing other required fields
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  // Note: Full integration test would require mocking Stripe SDK properly
  // This is a basic structure - actual implementation would need more setup
});

