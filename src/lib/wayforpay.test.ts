import { describe, expect, it } from 'vitest';
import { buildSignature, buildPaymentFormData, verifyCallbackSignature } from './wayforpay';

describe('buildSignature', () => {
  it('returns the correct HMAC-MD5 hex string for known inputs', () => {
    const fields = [
      'merchantTest',
      'example.com',
      'order123',
      '1700000000',
      '100',
      'UAH',
      'Test Tale',
      '1',
      '100',
    ];
    const result = buildSignature(fields, 'secretKey123');
    expect(result).toBe('ce3f98dd7e4a30e5bd2da4dbb8707ba0');
  });

  it('returns a 32-character hex string', () => {
    const result = buildSignature(['a', 'b'], 'secret');
    expect(result).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe('buildPaymentFormData', () => {
  const baseOrder = {
    orderId: 'order-abc-123',
    amount: 250,
    productName: 'Казка про їжачка',
    merchantAccount: 'test_merchant',
    merchantDomainName: 'example.com',
    serviceUrl: 'https://example.com/api/wayforpay/callback',
    returnUrl: 'https://example.com/payment/order-abc-123/success',
    cancelUrl: 'https://example.com/payment/order-abc-123/cancel',
    secretKey: 'test_secret_key',
  };

  it('includes all required fields', () => {
    const data = buildPaymentFormData(baseOrder);
    expect(data).toHaveProperty('merchantAccount', 'test_merchant');
    expect(data).toHaveProperty('merchantDomainName', 'example.com');
    expect(data).toHaveProperty('merchantTransactionSecureType', 'AUTO');
    expect(data).toHaveProperty('orderReference', 'order-abc-123');
    expect(data).toHaveProperty('orderDate');
    expect(data).toHaveProperty('amount', '250');
    expect(data).toHaveProperty('currency', 'UAH');
    expect(data).toHaveProperty('productName[]', 'Казка про їжачка');
    expect(data).toHaveProperty('productCount[]', '1');
    expect(data).toHaveProperty('productPrice[]', '250');
    expect(data).toHaveProperty('serviceUrl', baseOrder.serviceUrl);
    expect(data).toHaveProperty('returnUrl', baseOrder.returnUrl);
    expect(data).toHaveProperty('cancelUrl', baseOrder.cancelUrl);
    expect(data).toHaveProperty('merchantSignature');
  });

  it('merchantSignature is a 32-char hex string (HMAC-MD5)', () => {
    const data = buildPaymentFormData(baseOrder);
    expect(data.merchantSignature).toMatch(/^[0-9a-f]{32}$/);
  });

  it('currency is "UAH"', () => {
    const data = buildPaymentFormData(baseOrder);
    expect(data.currency).toBe('UAH');
  });

  it('orderReference equals the given orderId', () => {
    const data = buildPaymentFormData(baseOrder);
    expect(data.orderReference).toBe(baseOrder.orderId);
  });

  it('merchantTransactionSecureType is "AUTO"', () => {
    const data = buildPaymentFormData(baseOrder);
    expect(data.merchantTransactionSecureType).toBe('AUTO');
  });

  it('orderDate is a unix timestamp string (numeric, ~now)', () => {
    const before = Math.floor(Date.now() / 1000);
    const data = buildPaymentFormData(baseOrder);
    const after = Math.floor(Date.now() / 1000);
    const ts = parseInt(data.orderDate, 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe('verifyCallbackSignature', () => {
  const secret = 'secretKey123';

  const callbackBody = {
    merchantAccount: 'merchantTest',
    orderReference: 'order123',
    amount: 100,
    currency: 'UAH',
    authCode: 'AUTH001',
    cardPan: '4111****1111',
    transactionStatus: 'Approved',
    reasonCode: 1100,
    merchantSignature: '035213f23faa356a324fad78ef0cf7fd',
  };

  it('returns true for a valid signature', () => {
    expect(verifyCallbackSignature(callbackBody, secret)).toBe(true);
  });

  it('returns false for an invalid signature', () => {
    const tampered = { ...callbackBody, merchantSignature: 'deadbeefdeadbeefdeadbeefdeadbeef' };
    expect(verifyCallbackSignature(tampered, secret)).toBe(false);
  });

  it('returns false when the secret is wrong', () => {
    expect(verifyCallbackSignature(callbackBody, 'wrongSecret')).toBe(false);
  });

  it('returns false when a field value is altered', () => {
    const tampered = { ...callbackBody, transactionStatus: 'Declined' };
    expect(verifyCallbackSignature(tampered, secret)).toBe(false);
  });
});
