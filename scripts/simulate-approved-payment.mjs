#!/usr/bin/env node
/**
 * Simulates a WayForPay APPROVED webhook for a given orderReference.
 * Usage: node scripts/simulate-approved-payment.mjs <orderReference> [webhookUrl]
 *
 * Examples:
 *   node scripts/simulate-approved-payment.mjs cmq72wonu0001l60aupws9jkz
 *   node scripts/simulate-approved-payment.mjs cmq72wonu0001l60aupws9jkz https://kazka-iota.vercel.app/api/wayforpay/callback
 */

import { createHmac } from 'crypto'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env manually
const envPath = resolve(process.cwd(), '.env')
const env = {}
try {
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) env[match[1].trim()] = match[2].trim()
  }
} catch {
  console.error('Could not read .env file')
  process.exit(1)
}

const merchantAccount = env.WAYFORPAY_MERCHANT_ACCOUNT
const secret = env.WAYFORPAY_SECRET_KEY
const orderReference = process.argv[2]
const webhookUrl = process.argv[3] ?? 'http://localhost:3002/api/wayforpay/callback'

if (!orderReference) {
  console.error('Usage: node scripts/simulate-approved-payment.mjs <orderReference> [webhookUrl]')
  process.exit(1)
}
if (!merchantAccount || !secret) {
  console.error('WAYFORPAY_MERCHANT_ACCOUNT or WAYFORPAY_SECRET_KEY missing in .env')
  process.exit(1)
}

const body = {
  merchantAccount,
  orderReference,
  amount: 500,
  currency: 'UAH',
  authCode: 'TEST123',
  cardPan: '411111******1111',
  transactionStatus: 'Approved',
  reasonCode: 1100,
  transactionId: 'test-txn-' + Date.now(),
}

// Signature fields order: merchantAccount;orderReference;amount;currency;authCode;cardPan;transactionStatus;reasonCode
const sigFields = [
  body.merchantAccount,
  body.orderReference,
  String(body.amount),
  body.currency,
  body.authCode,
  body.cardPan,
  body.transactionStatus,
  String(body.reasonCode),
]
body.merchantSignature = createHmac('md5', secret).update(sigFields.join(';')).digest('hex')

console.log('Sending APPROVED webhook to:', webhookUrl)
console.log('Body:', JSON.stringify(body, null, 2))

const res = await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

const text = await res.text()
console.log('\nResponse status:', res.status)
console.log('Response body:', text)
