import { APIError, type CollectionConfig } from 'payload'

export const AffiliateSettings: CollectionConfig = {
  slug: 'affiliate-settings',
  admin: {
    useAsTitle: 'name',
    description:
      'Configure tier-based affiliate reward systems with commission percentages and free ticket rewards',
  },
  access: {
    // Add appropriate access controls based on your needs
  },
  fields: [
    {
      name: 'name',
      label: 'Setting Name',
      type: 'text',
      required: true,
      admin: {
        description:
          'A descriptive name for this affiliate tier configuration (e.g. "Concert XYZ Affiliate Program")',
      },
    },
    {
      name: 'event',
      label: 'Event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      admin: {
        description: 'The event this affiliate setting applies to',
      },
    },
    {
      name: 'affiliateUser',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The affiliate user setting applies to',
      },
      filterOptions: () => {
        return {
          role: {
            equals: 'affiliate',
          },
        }
      },
    },
    {
      name: 'promotions',
      label: 'Applied promotions',
      type: 'array',
      required: false,
      admin: {
        description: 'Promotions that are valid for this affiliate user',
      },
      fields: [
        {
          name: 'promotion',
          type: 'relationship',
          relationTo: 'promotions',
          admin: {
            description: 'Promotions filtered by event',
          },
          required: true,
          filterOptions: ({ data }) => {
            // if data.event is not defined, return empty promotions
            const eventId = data.event || -1

            return {
              event: {
                equals: eventId,
              },
            }
          },
        },
      ],
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (Array.isArray(value)) {
              const ids = value.map((item) => item.promotion)
              const hasDuplicates = new Set(ids).size !== ids.length
              if (hasDuplicates) {
                // handle specific promotion error
                const existIds = new Set()
                const duplicatePromotions: Array<{ promotion: number; index: number }> =
                  value.reduce(
                    (existArr, item, idx) => {
                      if (!existIds.has(item.promotion)) {
                        existIds.add(item.promotion)
                      } else {
                        existArr.push({
                          promotion: item.promotion,
                          index: idx,
                        })
                      }

                      return existArr
                    },
                    [] as Array<{ promotion: number; index: number }>,
                  )

                const errors = duplicatePromotions.map((item) => {
                  return {
                    message: `This promotion has already been added.`,
                    path: `promotions.${item.index}.promotion`,
                  }
                })

                throw new APIError(
                  'Promotions can not be duplicated',
                  400,
                  {
                    promotions: value,
                    errors: errors,
                  },
                  true,
                )
              }
            }
            return value
          },
        ],
      },
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this affiliate setting is currently active',
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Optional description of this affiliate program',
      },
    },
    {
      name: 'tiers',
      label: 'Affiliate Tiers',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Define the tier system with different reward levels based on performance',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'tierName',
          label: 'Tier Name',
          type: 'text',
          required: true,
          admin: {
            description: 'Name for this tier (e.g. "Beginner", "Intermediate", "Professional")',
          },
        },
        {
          name: 'tierLevel',
          label: 'Tier Level',
          type: 'number',
          required: true,
          min: 1,
          admin: {
            description: 'Numeric level for this tier (1 = lowest, higher numbers = higher tiers)',
          },
        },
        {
          name: 'quaCriteria',
          label: 'Qualification Criteria',
          type: 'group',
          admin: {
            description: 'Define how affiliates qualify for this tier',
          },
          fields: [
            {
              name: 'minTicketsSold',
              label: 'Minimum Tickets Sold',
              type: 'number',
              required: true,
              min: 1,
              admin: {
                description: 'Minimum number of tickets that must be sold to reach this tier',
              },
            },
            {
              name: 'maxTicketsSold',
              label: 'Maximum Tickets Sold',
              type: 'number',
              required: false,
              min: 1,
              admin: {
                description: 'Maximum number of tickets for this tier (leave empty for unlimited)',
              },
            },
            {
              name: 'minNetRevenue',
              label: 'Minimum Net Revenue (VND)',
              type: 'number',
              required: false,
              min: 0,
              admin: {
                description: 'Alternative qualification: minimum net revenue in VND',
              },
            },
            {
              name: 'maxNetRevenue',
              label: 'Maximum Net Revenue (VND)',
              type: 'number',
              required: false,
              min: 0,
              admin: {
                description: 'Maximum net revenue for this tier (leave empty for unlimited)',
              },
            },
            {
              name: 'eligTicketTypes',
              label: 'Eligible Ticket Types',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Zone 1', value: 'zone1' },
                { label: 'Zone 2', value: 'zone2' },
                { label: 'Zone 3', value: 'zone3' },
                { label: 'Zone 4', value: 'zone4' },
                { label: 'Zone 5', value: 'zone5' },
              ],
              admin: {
                description:
                  'Which ticket types count towards tier qualification (leave empty for all types)',
              },
            },
          ],
        },
        {
          name: 'rewards',
          label: 'Tier Rewards',
          type: 'group',
          admin: {
            description: 'Define the rewards for reaching this tier',
          },
          fields: [
            {
              name: 'commissionPercentage',
              label: 'Commission Percentage',
              type: 'number',
              required: true,
              min: 0,
              max: 100,
              admin: {
                description: 'Percentage of net revenue to pay as commission (e.g. 5 for 5%)',
              },
            },
            {
              name: 'freeTickets',
              label: 'Free Ticket Rewards',
              type: 'array',
              required: false,
              admin: {
                description: 'Free tickets awarded when reaching this tier',
              },
              fields: [
                {
                  name: 'ticketClass',
                  label: 'Ticket Class',
                  type: 'select',
                  required: true,
                  admin: {
                    description:
                      'Class of free ticket to award. The value decreases by zone, with Zone 1 being the most expensive ticket.',
                  },
                  options: [
                    { label: 'Zone 1', value: 'zone1' },
                    { label: 'Zone 2', value: 'zone2' },
                    { label: 'Zone 3', value: 'zone3' },
                    { label: 'Zone 4', value: 'zone4' },
                    { label: 'Zone 5', value: 'zone5' },
                  ],
                },
                {
                  name: 'quantity',
                  label: 'Quantity',
                  type: 'number',
                  required: true,
                  min: 1,
                  admin: {
                    description: 'Number of free tickets to award',
                  },
                },
                {
                  name: 'ticketValue',
                  label: 'Ticket Value (VND)',
                  type: 'number',
                  required: false,
                  min: 0,
                  admin: {
                    description:
                      'Amount (in VND) to be used as a substitute if free tickets are not available.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
