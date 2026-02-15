// ============================================
// Enums
// ============================================

export enum UserRole {
    CREATOR = "creator",
    BRAND = "brand",
    AGENCY = "agency",
    ADMIN = "admin",
}

export enum CampaignStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    PAID = "paid",
}

export enum PaymentStatus {
    PENDING = "pending",
    INVOICED = "invoiced",
    PAID = "paid",
    OVERDUE = "overdue",
}

export enum ExpenseCategory {
    PRODUCTION = "production",
    TRAVEL = "travel",
    AGENCY_FEE = "agency_fee",
    SOFTWARE = "software",
    EQUIPMENT = "equipment",
    TAX = "tax",
    OTHER = "other",
}

// ============================================
// Interfaces
// ============================================

export interface Profile {
    id: string;
    email: string;
    username: string | null;
    full_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    role: UserRole;
    agency_id: string | null;
    created_at: string;
    updated_at: string;
    selected_template: string; // 'simple' | ...
    social_links: {
        instagram?: string;
        tiktok?: string;
        youtube?: string;
        twitter?: string;
        linkedin?: string;
        // ... allow other keys
        [key: string]: string | undefined;
    } | null;
    featured_content: string[] | null; // Array of URLs
}

export interface Agency {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

export interface Campaign {
    id: string;
    title: string;
    description: string | null;
    status: CampaignStatus;
    budget: number | null;
    start_date: string | null;
    end_date: string | null;
    agency_id: string;
    created_by: string;
    created_at: string;
    updated_at: string;

    // Financial Fields
    currency: string; // 'EUR', 'USD', etc.
    payment_status: PaymentStatus;
    payment_method: string | null;
    invoice_date: string | null;
    invoice_number: string | null;
    payment_terms: number; // Days
    actual_hours: number | null;
    platform_breakdown: { [key: string]: number } | null;
}

export interface Expense {
    id: string;
    user_id: string;
    campaign_id: string | null;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    receipt_url: string | null;
    created_at: string;
    updated_at: string;
}
