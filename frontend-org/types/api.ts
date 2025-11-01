/**
 * API Type Definitions
 *
 * TypeScript interfaces for API requests and responses
 */

/**
 * User modules
 */
export type UserModule = "ORG" | "TOWERS";

/**
 * User interface matching backend User model
 */
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  module: UserModule;
  profile_picture?: string;
  date_joined: string;
  last_login: string | null;
}

/**
 * Authentication request/response types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  module: UserModule;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  uid: string;
  token: string;
  new_password: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Event types (from backend event app)
 */
export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string;
  is_public: boolean;
  max_participants: number | null;
  registration_deadline: string | null;
  created_by: User;
  created_at: string;
  updated_at: string;
}

/**
 * Membership types
 */
export type MembershipStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "PENDING";

export interface Membership {
  id: number;
  user: User;
  membership_type: string;
  status: MembershipStatus;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Order/Payment types
 */
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
export type PaymentMethod = "CARD" | "SWISH" | "BANKGIRO" | "OTHER";

export interface Order {
  id: number;
  user: User;
  order_number: string;
  status: OrderStatus;
  total_amount: string;
  currency: string;
  payment_method: PaymentMethod | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface OrderItem {
  id: number;
  order: number;
  product_type: string;
  product_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
}

/**
 * Document types
 */
export interface Document {
  id: number;
  title: string;
  description: string;
  file: string;
  document_type: string;
  is_public: boolean;
  uploaded_by: User;
  uploaded_at: string;
  updated_at: string;
}

/**
 * Product types
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  product_type: string;
  is_active: boolean;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
}
