import type { CollectionConfig } from 'payload';

export const ZaloPayOrder: CollectionConfig = {
  slug: 'zalopay-orders',
  admin: {
    useAsTitle: 'app_trans_id', 
  },
  fields: [
    {
      name: 'app_trans_id',
      type: 'text',
      label: 'App Trans ID',
      required: true,
      unique: true,
    },
    {
      name: 'items',
      type: 'text',
      label: 'Items',
      admin: {
        description: 'JSON array or object of items purchased.',
      },
    },
    {
      name: 'amount',
      type: 'number',
      label: 'Amount (VND)',
      required: true,
      admin: {
        description: 'Total amount of the order in VND.',
      },
    },
    {
      name: 'zp_trans_token',
      type: 'text',
      label: 'ZaloPay Trans Token',
      admin: {
        description: 'Token returned by ZaloPay for this order.',
      },
    },
  ],
};

export default ZaloPayOrder;
