/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

/**
 * Supported timezones in IANA format.
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "supportedTimezones".
 */
export type SupportedTimezones =
  | 'Pacific/Midway'
  | 'Pacific/Niue'
  | 'Pacific/Honolulu'
  | 'Pacific/Rarotonga'
  | 'America/Anchorage'
  | 'Pacific/Gambier'
  | 'America/Los_Angeles'
  | 'America/Tijuana'
  | 'America/Denver'
  | 'America/Phoenix'
  | 'America/Chicago'
  | 'America/Guatemala'
  | 'America/New_York'
  | 'America/Bogota'
  | 'America/Caracas'
  | 'America/Santiago'
  | 'America/Buenos_Aires'
  | 'America/Sao_Paulo'
  | 'Atlantic/South_Georgia'
  | 'Atlantic/Azores'
  | 'Atlantic/Cape_Verde'
  | 'Europe/London'
  | 'Europe/Berlin'
  | 'Africa/Lagos'
  | 'Europe/Athens'
  | 'Africa/Cairo'
  | 'Europe/Moscow'
  | 'Asia/Riyadh'
  | 'Asia/Dubai'
  | 'Asia/Baku'
  | 'Asia/Karachi'
  | 'Asia/Tashkent'
  | 'Asia/Calcutta'
  | 'Asia/Dhaka'
  | 'Asia/Almaty'
  | 'Asia/Jakarta'
  | 'Asia/Bangkok'
  | 'Asia/Shanghai'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'Asia/Seoul'
  | 'Australia/Sydney'
  | 'Pacific/Guam'
  | 'Pacific/Noumea'
  | 'Pacific/Auckland'
  | 'Pacific/Fiji';

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  blocks: {};
  collections: {
    users: User;
    media: Media;
    seatingCharts: SeatingChart;
    events: Event;
    orders: Order;
    orderItems: OrderItem;
    payments: Payment;
    tickets: Ticket;
    app_information: AppInformation;
    partners: Partner;
    performers: Performer;
    faqs: Faq;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  collectionsJoins: {};
  collectionsSelect: {
    users: UsersSelect<false> | UsersSelect<true>;
    media: MediaSelect<false> | MediaSelect<true>;
    seatingCharts: SeatingChartsSelect<false> | SeatingChartsSelect<true>;
    events: EventsSelect<false> | EventsSelect<true>;
    orders: OrdersSelect<false> | OrdersSelect<true>;
    orderItems: OrderItemsSelect<false> | OrderItemsSelect<true>;
    payments: PaymentsSelect<false> | PaymentsSelect<true>;
    tickets: TicketsSelect<false> | TicketsSelect<true>;
    app_information: AppInformationSelect<false> | AppInformationSelect<true>;
    partners: PartnersSelect<false> | PartnersSelect<true>;
    performers: PerformersSelect<false> | PerformersSelect<true>;
    faqs: FaqsSelect<false> | FaqsSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
  };
  db: {
    defaultIDType: number;
  };
  globals: {};
  globalsSelect: {};
  locale: null;
  user: User & {
    collection: 'users';
  };
  jobs: {
    tasks: unknown;
    workflows: unknown;
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: ('admin' | 'super-admin' | 'customer') | null;
  lastActive?: string | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: number;
  alt: string;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "seatingCharts".
 */
export interface SeatingChart {
  id: number;
  title: string;
  chartMap:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  event?: (number | null) | Event;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "events".
 */
export interface Event {
  id: number;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  keyword?: string | null;
  startDatetime?: string | null;
  endDatetime?: string | null;
  schedules?:
    | {
        date?: string | null;
        details?:
          | {
              time?: string | null;
              name?: string | null;
              description?: string | null;
              id?: string | null;
            }[]
          | null;
        id?: string | null;
      }[]
    | null;
  showAfterExpiration?: boolean | null;
  showTicketsAutomatically?: boolean | null;
  eventLocation?: string | null;
  eventTermsAndConditions?: string | null;
  ticketPrices?:
    | {
        name?: string | null;
        price?: number | null;
        currency?: string | null;
        id?: string | null;
      }[]
    | null;
  eventLogo?: (number | null) | Media;
  eventBanner?: (number | null) | Media;
  sponsorLogo?: (number | null) | Media;
  ticketQuantityLimitation?: ('perTicketType' | 'perEvent') | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "orders".
 */
export interface Order {
  id: number;
  orderCode?: string | null;
  user?: (number | null) | User;
  status?: string | null;
  total?: number | null;
  currency?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "orderItems".
 */
export interface OrderItem {
  id: number;
  order: number | Order;
  event: number | Event;
  ticketPriceId: string;
  quantity: number;
  price: number;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payments".
 */
export interface Payment {
  id: number;
  user: number | User;
  order: number | Order;
  paymentMethod?: string | null;
  currency?: string | null;
  total: number;
  appTransId?: string | null;
  paymentData?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  status: 'processing' | 'canceled' | 'paid' | 'failed';
  paidAt?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tickets".
 */
export interface Ticket {
  id: number;
  attendeeName?: string | null;
  user?: (number | null) | User;
  ticketCode?: string | null;
  ticketPriceInfo?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  event?: (number | null) | Event;
  orderItem?: (number | null) | OrderItem;
  orderStatus?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "app_information".
 */
export interface AppInformation {
  id: number;
  name: string;
  logo?: (number | null) | Media;
  description?: string | null;
  address?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  socials?:
    | {
        name?: string | null;
        icon?: string | null;
        link?: string | null;
        id?: string | null;
      }[]
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "partners".
 */
export interface Partner {
  id: number;
  name: string;
  logo?: (number | null) | Media;
  description?: string | null;
  status?: ('active' | 'inactive') | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "performers".
 */
export interface Performer {
  id: number;
  name: string;
  avatar?: (number | null) | Media;
  genre?: string | null;
  role?: string | null;
  description?: string | null;
  status?: ('active' | 'inactive') | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "faqs".
 */
export interface Faq {
  id: number;
  question: string;
  answer: string;
  status?: ('active' | 'inactive') | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents".
 */
export interface PayloadLockedDocument {
  id: number;
  document?:
    | ({
        relationTo: 'users';
        value: number | User;
      } | null)
    | ({
        relationTo: 'media';
        value: number | Media;
      } | null)
    | ({
        relationTo: 'seatingCharts';
        value: number | SeatingChart;
      } | null)
    | ({
        relationTo: 'events';
        value: number | Event;
      } | null)
    | ({
        relationTo: 'orders';
        value: number | Order;
      } | null)
    | ({
        relationTo: 'orderItems';
        value: number | OrderItem;
      } | null)
    | ({
        relationTo: 'payments';
        value: number | Payment;
      } | null)
    | ({
        relationTo: 'tickets';
        value: number | Ticket;
      } | null)
    | ({
        relationTo: 'app_information';
        value: number | AppInformation;
      } | null)
    | ({
        relationTo: 'partners';
        value: number | Partner;
      } | null)
    | ({
        relationTo: 'performers';
        value: number | Performer;
      } | null)
    | ({
        relationTo: 'faqs';
        value: number | Faq;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: number;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: number;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users_select".
 */
export interface UsersSelect<T extends boolean = true> {
  username?: T;
  firstName?: T;
  lastName?: T;
  role?: T;
  lastActive?: T;
  updatedAt?: T;
  createdAt?: T;
  email?: T;
  resetPasswordToken?: T;
  resetPasswordExpiration?: T;
  salt?: T;
  hash?: T;
  loginAttempts?: T;
  lockUntil?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media_select".
 */
export interface MediaSelect<T extends boolean = true> {
  alt?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "seatingCharts_select".
 */
export interface SeatingChartsSelect<T extends boolean = true> {
  title?: T;
  chartMap?: T;
  event?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "events_select".
 */
export interface EventsSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  description?: T;
  keyword?: T;
  startDatetime?: T;
  endDatetime?: T;
  schedules?:
    | T
    | {
        date?: T;
        details?:
          | T
          | {
              time?: T;
              name?: T;
              description?: T;
              id?: T;
            };
        id?: T;
      };
  showAfterExpiration?: T;
  showTicketsAutomatically?: T;
  eventLocation?: T;
  eventTermsAndConditions?: T;
  ticketPrices?:
    | T
    | {
        name?: T;
        price?: T;
        currency?: T;
        id?: T;
      };
  eventLogo?: T;
  eventBanner?: T;
  sponsorLogo?: T;
  ticketQuantityLimitation?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "orders_select".
 */
export interface OrdersSelect<T extends boolean = true> {
  orderCode?: T;
  user?: T;
  status?: T;
  total?: T;
  currency?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "orderItems_select".
 */
export interface OrderItemsSelect<T extends boolean = true> {
  order?: T;
  event?: T;
  ticketPriceId?: T;
  quantity?: T;
  price?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payments_select".
 */
export interface PaymentsSelect<T extends boolean = true> {
  user?: T;
  order?: T;
  paymentMethod?: T;
  currency?: T;
  total?: T;
  appTransId?: T;
  paymentData?: T;
  status?: T;
  paidAt?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tickets_select".
 */
export interface TicketsSelect<T extends boolean = true> {
  attendeeName?: T;
  user?: T;
  ticketCode?: T;
  ticketPriceInfo?: T;
  event?: T;
  orderItem?: T;
  orderStatus?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "app_information_select".
 */
export interface AppInformationSelect<T extends boolean = true> {
  name?: T;
  logo?: T;
  description?: T;
  address?: T;
  email?: T;
  phoneNumber?: T;
  socials?:
    | T
    | {
        name?: T;
        icon?: T;
        link?: T;
        id?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "partners_select".
 */
export interface PartnersSelect<T extends boolean = true> {
  name?: T;
  logo?: T;
  description?: T;
  status?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "performers_select".
 */
export interface PerformersSelect<T extends boolean = true> {
  name?: T;
  avatar?: T;
  genre?: T;
  role?: T;
  description?: T;
  status?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "faqs_select".
 */
export interface FaqsSelect<T extends boolean = true> {
  question?: T;
  answer?: T;
  status?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents_select".
 */
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T;
  globalSlug?: T;
  user?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences_select".
 */
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T;
  key?: T;
  value?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations_select".
 */
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T;
  batch?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "auth".
 */
export interface Auth {
  [k: string]: unknown;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}