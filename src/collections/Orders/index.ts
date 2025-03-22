import type { CollectionConfig, FieldHook } from 'payload'
import { afterChangeStatus } from './hooks/afterChangeStatus';
// Helper to generate afterRead hooks for user fields
const getFullNameFromCustomerData = (data?: {
  firstName?: string;
  lastName?: string;
}) => {
  if (!data) return '';
  const { firstName = '', lastName = '' } = data;
  return [firstName, lastName].filter(Boolean).join(' ');
};

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
    },
    {
      name: 'userName',
      type: 'text',
      virtual: true,
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
      virtual: true,
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
      virtual: true,
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
    }, {
      name: 'orderTickets',
      type: 'join',
      collection: 'tickets',
      on: 'orderItem',
      admin: {
        defaultColumns: ['id', 'ticketCode'],
      },
    },
    {
      name: 'Ticketcodes',
      type: 'text',
      virtual: true,
      hooks: {
        afterRead: [
          async ({ context, originalDoc, req }) => {

            if (context.triggerAfterLookup === false) {
              return;
            }

            if (Array.isArray(originalDoc?.orderTickets?.docs)) {

              const codes = await Promise.all(
                originalDoc.orderTickets.docs.map(async (ticketDoc: any) => {

                  const ticket = await req.payload.findByID({
                    collection: "tickets",
                    id: ticketDoc,
                    context: {
                      triggerAfterLookup: false,  // Prevent recursive triggers
                    },
                  });

                  return ticket?.ticketCode;
                })
              );

              return codes.join(', ');
            }
          },
        ],
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
      name: 'total',
      type: 'number',
    },
    {
      name: 'currency',
      type: 'text',
    },
  ],
}
