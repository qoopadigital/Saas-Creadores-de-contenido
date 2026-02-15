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
}
