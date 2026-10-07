/** Admin constants shared by server code and client components. Keep this file free of server-only imports. */

export const SESSION_COOKIE = 'admin_session';

export const ADMIN_ROUTES = {
  login: '/admin/login',
  dashboard: '/admin',
  leads: '/admin/leads',
  leadsExport: '/admin/leads/export',
  customers: '/admin/customers',
  customersNew: '/admin/customers/new',
  customersExport: '/admin/customers/export',
  blog: '/admin/blog',
  blogNew: '/admin/blog/new',
  users: '/admin/users',
  activity: '/admin/activity',
  account: '/admin/account',
} as const;

export const USER_ROLES = ['owner', 'staff'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = { owner: 'Owner', staff: 'Staff' };

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
  spam: 'Spam',
};

/** Statuses that still need someone to act. */
export const OPEN_LEAD_STATUSES: readonly LeadStatus[] = ['new', 'contacted', 'quoted'];

export const LEAD_TYPE_LABELS = { quote: 'Quote', contact: 'Contact', callback: 'Callback' } as const;

export const POST_STATUSES = ['draft', 'published'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export const POST_STATUS_LABELS: Record<PostStatus, string> = { draft: 'Draft', published: 'Published' };

/** Customer list segments used for retargeting. */
export const CUSTOMER_SEGMENTS = ['all', 'opted-in', 'due'] as const;
export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number];
export const CUSTOMER_SEGMENT_LABELS: Record<CustomerSegment, string> = {
  all: 'All customers',
  'opted-in': 'Agreed to offers',
  due: 'Agreed to offers, not contacted in 90 days',
};
/** A customer is due for a message when nobody has contacted them for this many days. */
export const RETARGET_AFTER_DAYS = 90;

export const PASSWORD_MIN_LENGTH = 10;
