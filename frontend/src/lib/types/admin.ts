export interface AdminBusiness {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  category_name: string | null;
  area_name: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  qualification_score: number | null;
  qualified: boolean;
  award_tier: "basic" | "pro" | "premium" | null;
  award_status: string | null;
  outreach_status: string | null;
}

export interface AdminOutreach {
  id: string;
  business_id: string;
  business_name: string;
  email_address: string;
  sequence_step: number;
  status: "pending" | "sent" | "opened" | "clicked" | "responded" | "bounced" | "unsubscribed";
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

export interface AdminAward {
  id: string;
  business_id: string;
  business_name: string;
  category_name: string | null;
  area_name: string | null;
  tier: "basic" | "pro" | "premium";
  status: "offered" | "purchased" | "fulfilled" | "expired";
  year: number;
  qualification_score: number | null;
  offered_at: string | null;
  purchased_at: string | null;
  fulfilled_at: string | null;
}

export interface AdminAnalytics {
  businesses_discovered: number;
  businesses_qualified: number;
  outreach_sent: number;
  outreach_opened: number;
  outreach_clicked: number;
  outreach_responded: number;
  awards_offered: number;
  awards_purchased: number;
  awards_fulfilled: number;
  revenue_cents: number;
}
