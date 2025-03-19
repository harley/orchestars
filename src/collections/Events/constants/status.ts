export const EVENT_STATUS = {
  draft: {
    label: 'Draft', // Event is being prepared, not visible
    value: 'draft',
  },
  published_upcoming: {
    label: 'Published - Upcoming', // Announced, but tickets not on sale yet
    value: 'published_upcoming',
  },
  published_open_sales: {
    label: 'Published - Open for Sales', // Users can visit and buy tickets, event is 20 days away
    value: 'published_open_sales',
  },
  completed: {
    label: 'Completed', // Event has ended
    value: 'completed',
  },
  cancelled: {
    label: 'Cancelled', // Event was called off
    value: 'cancelled',
  },
}

export const EVENT_STATUSES = Object.values(EVENT_STATUS)
