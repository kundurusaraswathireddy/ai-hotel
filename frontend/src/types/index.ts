export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface BookingInput {
  hotel: string;
  lead_time: number;
  arrival_date_year: number;
  arrival_date_month: string;
  arrival_date_week_number: number;
  arrival_date_day_of_month: number;
  stays_in_weekend_nights: number;
  stays_in_week_nights: number;
  adults: number;
  children: number;
  babies: number;
  meal: string;
  country: string;
  market_segment: string;
  distribution_channel: string;
  is_repeated_guest: number;
  previous_cancellations: number;
  previous_bookings_not_canceled: number;
  reserved_room_type: string;
  assigned_room_type: string;
  booking_changes: number;
  deposit_type: string;
  days_in_waiting_list: number;
  customer_type: string;
  adr: number;
  required_car_parking_spaces: number;
  total_of_special_requests: number;
}

export interface PredictionResult {
  cancellation_probability: number;
  predicted_cancellation: number;
  threshold: number;
  risk_tier: RiskTier;
  total_nights: number;
  booking_value: number;
  estimated_revenue_at_risk: number;
  model_name: string;
  model_version: string;
  key_drivers: {
    feature: string;
    impact: string;
    value: string;
    direction: 'increase' | 'decrease' | 'neutral';
  }[];
  risk_story: string;
  timestamp: number;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  pr_auc: number;
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  business_cost: number;
  normalized_business_cost: number;
}

export interface ModelEntry {
  name: string;
  version: string;
  type: string;
  status: 'CHAMPION' | 'CANDIDATE' | 'PRODUCTION' | 'ARCHIVED' | 'UNAVAILABLE';
  is_production?: boolean;
  optimal_threshold: number;
  model_selection_score: number;
  metrics: ModelMetrics;
  metrics_at_0_5: ModelMetrics;
  cv_roc_auc_mean: number;
  cv_roc_auc_std: number;
  training_time_seconds: number;
  inference_time_ms_per_1k: number;
  threshold_curve: {
    threshold: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    business_cost: number;
    business_score: number;
  }[];
  roc_curve?: { fpr: number; tpr: number }[];
  champion_rationale?: string;
  notes?: string;
}

export interface OverviewStats {
  total_bookings: number;
  canceled_bookings: number;
  non_canceled_bookings: number;
  cancellation_rate: number;
  average_lead_time_days: number;
  average_adr: number;
  total_gross_booking_value: number;
  historical_canceled_revenue_loss: number;
  champion_model: string;
  model_version: string;
  optimal_threshold: number;
}

export interface RadarPoint {
  booking_id: string;
  lead_time: number;
  cancellation_probability: number;
  booking_value: number;
  revenue_at_risk: number;
  risk_tier: RiskTier;
  hotel: string;
  market_segment: string;
  deposit_type: string;
  actual_canceled: number;
}
