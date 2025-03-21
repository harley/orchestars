import type { CollectionConfig, FieldHook } from 'payload'
import { afterChangeStatus } from './hooks/afterChangeStatus';

// Helper to generate afterRead hooks for user fields
const generateUserFieldAfterRead = (getValue: (user: any) => string): FieldHook => async ({ data, req }) => {
  if (data?.user) {
    const user = await req.payload.findByID({ collection: 'users', id: data?.user });
    return user ? getValue(user) : '';
  }
  return '';
};

const getTicketCodesFromOrderItems: FieldHook = async ({ data, req }) => {
  if (!data?.id) return [];

  const orderItems = await req.payload.find({
    collection: 'orderItems',
    where: {
      order: { equals: data.id },
    },
  });

  if (orderItems.docs.length === 0) return [];

  const ticketCodes: string[] = [];

  for (const item of orderItems.docs) {
    const tickets = await req.payload.find({
      collection: 'tickets',
      where: {
        orderItem: { equals: item.id },
      },
    });

    tickets.docs?.forEach((ticket) => {
      if (ticket?.ticketCode) ticketCodes.push(ticket.ticketCode);
    });
  }
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
    defaultColumns: ['orderCode', 'userName', 'userEmail', 'userPhoneNumber', 'status', 'total'],
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
        afterRead: [generateUserFieldAfterRead((user) => `${user.firstName || ''} ${user.lastName || ''}`.trim())],
      },
    },
    {
      name: 'userEmail',
      type: 'text',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
      hooks: {
        beforeChange: [clearField],
        afterRead: [generateUserFieldAfterRead((user) => user.email || '')],
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
          generateUserFieldAfterRead(
            (user) => user.phoneNumber || user.phoneNumbers?.find((p: { isUsing: any; }) => p.isUsing)?.phone || ''
          ),
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
      admin: { readOnly: true},
      fields: [
        {
          name: 'code',
          type: 'text',
        },
      ],
      hooks: {
        beforeChange: [clearField],
        afterRead: [getTicketCodesFromOrderItems],
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
