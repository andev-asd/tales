import { z } from 'zod'

export const deliverySchema = z
  .object({
    service: z.enum(['NOVA_POSHTA', 'UKRPOSHTA']),
    deliveryType: z.enum(['BRANCH', 'COURIER']),
    city: z.string().min(2, 'Вкажіть місто'),
    branchNumber: z.string().optional(),
    street: z.string().optional(),
    house: z.string().optional(),
    apartment: z.string().optional(),
    recipientName: z.string().min(2, 'Вкажіть ПІБ отримувача'),
    recipientPhone: z
      .string()
      .regex(/^\+380\d{9}$/, 'Телефон у форматі +380XXXXXXXXX'),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === 'COURIER' && data.service !== 'NOVA_POSHTA') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryType'],
        message: "Кур'єрська доставка доступна тільки для Нової Пошти",
      })
    }
    if (data.deliveryType === 'BRANCH' && !data.branchNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['branchNumber'],
        message: 'Вкажіть номер відділення',
      })
    }
    if (data.deliveryType === 'COURIER') {
      if (!data.street?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['street'],
          message: 'Вкажіть вулицю',
        })
      }
      if (!data.house?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['house'],
          message: 'Вкажіть будинок',
        })
      }
    }
  })

export type DeliveryInput = z.infer<typeof deliverySchema>
