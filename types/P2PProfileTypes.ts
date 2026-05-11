// ─── Sell Method Field Definition (from backend JSON) ────────────────────────

export type FieldType = "text" | "tel" | "email" | "number";

export type SellMethodField = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  pattern?: string;
  mono?: boolean;
};

// ─── Sell Method (from GET /api/sell-methods) ─────────────────────────────────

export type SellMethodOption = {
  value: number;          // sell_method.id
  label: string;          // "Bkash", "Bank Transfer", etc.
  currency_id: number;
  icon?: string;
  fields: SellMethodField[];
};

// ─── Currency ─────────────────────────────────────────────────────────────────

export type CurrencyOption = {
  value: number;
  label: string;          // "USD", "BDT", etc.
};

// ─── User Payment Method (from GET /api/user/payment-methods) ─────────────────

export type UserPaymentMethod = {
  id: number;
  sell_method_id: number;
  currency_id: number;
  method_name: string;    // e.g. "Bkash"
  currency_name: string;  // e.g. "BDT"
  fields: SellMethodField[];        // field definitions (for display labels)
  field_values: Record<string, string>;  // actual values
  remarks?: string;
  qr_code?: string;
  is_active: boolean;
  created_at: string;
};

// ─── Form Data (sent to POST / PUT) ──────────────────────────────────────────

export type PaymentFormData = {
  sell_method_id: number;
  currency_id: number;
  field_values: Record<string, string>;
  remarks?: string;
  qr_code?: File | null; 
};

// ─── Modal ────────────────────────────────────────────────────────────────────

export type ModalMode = "add" | "edit";

export type PaymentModalProps = {
  mode: ModalMode;
  initialData?: UserPaymentMethod;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
};

export type DeleteConfirmModalProps = {
  methodName: string;
  onClose: () => void;
  onConfirm: () => void;
};

// ─── Sub-component Props ──────────────────────────────────────────────────────

export type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
};

export type BadgeCheckProps = {
  label: string;
};

export type PaymentCardProps = {
  method: UserPaymentMethod;
  onEdit?: (method: UserPaymentMethod) => void;
  onDelete?: (id: number) => void;
};

export type TabId =
  | "payment"
  | "my-ads"
  | "feedback"
  | "blocked"
  | "follows"
  | "restrictions"
  | "notifications";

export type TabItem = { id: TabId; label: string };