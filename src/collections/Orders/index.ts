import type { CollectionConfig, FieldHook } from 'payload'
import { afterChangeStatus } from './hooks/afterChangeStatus';
import { FieldHookArgs } from 'payload'
// Helper to generate afterRead hooks for user fields
const getFullNameFromCustomerData = (data?: {
  firstName?: string;
  lastName?: string;
}) => {
  if (!data) return '';
  const { firstName = '', lastName = '' } = data;
  return [firstName, lastName].filter(Boolean).join(' ');
};

const populateTicketCodes = async ({  originalDoc, req }: FieldHookArgs) => {

  const ticketCodes: string[] = [];

  try {
    const orderItems = await req.payload
      .find({
        collection: 'orderItems',
        where: { order: { equals: originalDoc?.id } },
      })
      .then((res) => res.docs)

    if (!orderItems?.length) {
      return
    }

  } catch (error) {
    console.error('Error getting ticket:', error)
  }
  return ticketCodes;
}


// Common beforeChange hook to clear virtual fields
const clearField: FieldHook = ({ siblingData, field }) => {
  if (field?.name) {
    siblingData[field.name] = undefined;
  }
};

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderCode',
    defaultColumns: ['orderCode', 'status', 'total'],
  },
  fields: [
    {
      name: 'orderCode',
      type: 'text',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'userName',
      type: 'text',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
      hooks: {
        beforeChange: [clearField],
        afterRead: [
          ({ data }) => {
            return getFullNameFromCustomerData(data?.customerData);
          },
        ],
      },
    },
    {
      name: 'userEmail',
      type: 'text',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
      hooks: {
        beforeChange: [clearField],
        afterRead: [
          ({ data }) => {
            return data?.customerData?.email || '';
          },
        ],
      },
    },
    {
      name: 'userPhoneNumber',
      type: 'text',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
      hooks: {
        beforeChange: [clearField],
        afterRead: [
          ({ data }) => {
            return data?.customerData?.phoneNumber || '';
          },
        ],
      },
    },
    {
      name: 'payments',
      type: 'join',
      collection: 'payments',
      on: 'order'
    },
    {
      name: 'orderItems',
      type: 'join',
      collection: 'orderItems',
      on: 'order'
    },
    {
      name: 'ticketCodes',
      type: 'array',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
      fields: [{ name: 'code', type: 'text' }],
      hooks: {
        beforeChange: [clearField],
        afterRead: [populateTicketCodes],
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'processing',
      options: [
        { label: 'Processing', value: 'processing' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      hooks: {
        afterChange: [afterChangeStatus],
      },
    },
    {
      name: 'currency',
      type: 'text',
    },
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: false,
    },
    {
      name: 'promotionCode',
      type: 'text',
      required: false,
    },
    {
      name: 'totalBeforeDiscount',
      type: 'number',
      required: false,
    },
    {
      name: 'totalDiscount',
      type: 'number',
      required: false,
    },
    {
      name: 'total',
      type: 'number',
    },
    {
      name: 'customerData',
      type: 'json',
    },
  ],

};

export default Orders;
