import { createHmac } from 'crypto';

export interface PaymentOrderData {
  orderId: string;
  amount: number;
  productName: string;
  merchantAccount: string;
  merchantDomainName: string;
  serviceUrl: string;
  returnUrl: string;
  cancelUrl: string;
  secretKey: string;
}

export interface WayForPayCallback {
  merchantAccount: string;
  orderReference: string;
  amount: number;
  currency: string;
  authCode: string;
  cardPan: string;
  transactionStatus: string;
  reasonCode: number;
}

export function buildSignature(fields: string[], secret: string): string {
  const data = fields.join(';');
  return createHmac('md5', secret).update(data).digest('hex');
}

export function buildPaymentFormData(order: PaymentOrderData): Record<string, string> {
  const orderDate = Math.floor(Date.now() / 1000).toString();
  const amount = order.amount.toString();
  const currency = 'UAH';
  const productCount = '1';
  const productPrice = amount;

  const signatureFields = [
    order.merchantAccount,
    order.merchantDomainName,
    order.orderId,
    orderDate,
    amount,
    currency,
    order.productName,
    productCount,
    productPrice,
  ];

  const merchantSignature = buildSignature(signatureFields, order.secretKey);

  return {
    merchantAccount: order.merchantAccount,
    merchantDomainName: order.merchantDomainName,
    merchantTransactionSecureType: 'AUTO',
    orderReference: order.orderId,
    orderDate,
    amount,
    currency,
    'productName[]': order.productName,
    'productCount[]': productCount,
    'productPrice[]': productPrice,
    serviceUrl: order.serviceUrl,
    returnUrl: order.returnUrl,
    cancelUrl: order.cancelUrl,
    merchantSignature,
  };
}

export function verifyCallbackSignature(
  body: WayForPayCallback & { merchantSignature: string },
  secret: string
): boolean {
  const fields = [
    body.merchantAccount,
    body.orderReference,
    String(body.amount),
    body.currency,
    body.authCode,
    body.cardPan,
    body.transactionStatus,
    String(body.reasonCode),
  ];

  const expected = buildSignature(fields, secret);
  return expected === body.merchantSignature;
}
