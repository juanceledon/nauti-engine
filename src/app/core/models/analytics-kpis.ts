export interface AnalyticsKpis {
  total_active_operations: number;
  total_savings_mxn: number;
  total_negotiated_value_mxn: number;
  autonomous_resolution_rate: number;
  mandate_compliance_rate: number;
  avg_negotiation_time_minutes: number;
  verified_commitments_count: number;
}

export function emptyAnalyticsKpis(): AnalyticsKpis {
  return {
    total_active_operations: 0,
    total_savings_mxn: 0,
    total_negotiated_value_mxn: 0,
    autonomous_resolution_rate: 0,
    mandate_compliance_rate: 0,
    avg_negotiation_time_minutes: 0,
    verified_commitments_count: 0
  };
}