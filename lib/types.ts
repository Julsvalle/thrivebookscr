export type Locale = "es" | "en";

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  description_es: string;
  description_en: string;
  price_crc: number;
  cover_url: string | null;
  genre: string;
  language: string;
  condition: "nuevo" | "usado_buen_estado" | "usado";
  stock: number;
  featured: boolean;
  active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  created_at: string;
}

export type ShippingMethod = "uber_flash" | "didi" | "correos";

export type OrderStatus =
  | "pending_payment"
  | "awaiting_confirmation"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ShippingAddress {
  province: string;
  canton: string;
  address_line: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  shipping_method: ShippingMethod;
  shipping_address: ShippingAddress;
  status: OrderStatus;
  total_crc: number;
  sinpe_confirmed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  quantity: number;
  unit_price_crc: number;
  book?: Book;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  shipping_method: ShippingMethod;
  province: string;
  canton: string;
  address_line: string;
  address_notes: string;
  create_account: boolean;
  password?: string;
}

// Shipping costs in CRC
export const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  uber_flash: 2500,
  didi: 2000,
  correos: 3000,
};
