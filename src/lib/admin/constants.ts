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
  products: '/admin/products',
  vendors: '/admin/vendors',
  vendorsNew: '/admin/vendors/new',
  stock: '/admin/stock',
  installations: '/admin/installations',
  invoices: '/admin/invoices',
  invoicesNew: '/admin/invoices/new',
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

/** Upper limit for a product's warranty length. */
export const MAX_WARRANTY_YEARS = 25;

/** Smallest and largest roll of film that can be allocated: width in centimetres, length in metres. */
export const ROLL_LIMITS = { widthCm: { min: 10, max: 200 }, lengthM: { min: 0.5, max: 100 } } as const;

/** Plain-English names for audit log actions. Unknown actions are shown as recorded. */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'auth.signed_in': 'Signed in',
  'auth.signed_out': 'Signed out',
  'account.password_changed': 'Changed own password',
  'user.created': 'Added a user',
  'user.updated': 'Updated a user',
  'user.password_reset': 'Reset a password',
  'lead.status_changed': 'Changed lead status',
  'lead.follow_up_set': 'Set a follow-up',
  'lead.note_added': 'Added a lead note',
  'lead.exported': 'Exported leads',
  'customer.created': 'Added a customer',
  'customer.created_from_lead': 'Turned a lead into a customer',
  'customer.updated': 'Updated a customer',
  'customer.vehicle_added': 'Added a vehicle',
  'customer.vehicle_removed': 'Removed a vehicle',
  'customer.note_added': 'Added a customer note',
  'customer.contacted': 'Marked a customer as contacted',
  'customer.exported': 'Exported customers',
  'post.created': 'Created a post',
  'post.updated': 'Updated a post',
  'post.deleted': 'Deleted a post',
  'product.created': 'Added a product',
  'product.updated': 'Updated a product',
  'vendor.created': 'Added a vendor',
  'vendor.updated': 'Updated a vendor',
  'vendor.login_created': 'Created a vendor sign-in',
  'vendor.login_reset': 'Reset a vendor password',
  'vendor.login_updated': 'Switched a vendor sign-in on or off',
  'stock.allocated': 'Allocated a roll to a vendor',
  'stock.removed': 'Took back an unused roll',
  'installation.recorded': 'Recorded an installation',
  'installation.voided': 'Voided an installation',
  'invoice.created': 'Created an invoice',
  'invoice.updated': 'Updated an invoice',
  'invoice.issued': 'Issued an invoice',
  'invoice.paid': 'Marked an invoice as paid',
  'invoice.cancelled': 'Cancelled an invoice',
  'invoice.draft': 'Reverted an invoice to draft',
  'vendor.signed_in': 'Vendor signed in',
  'vendor.signed_out': 'Vendor signed out',
  'vendor.password_changed': 'Vendor changed own password',
};
