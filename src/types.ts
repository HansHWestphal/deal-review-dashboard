export interface Opportunity {
  id: string;
  name: string;
  accountName: string;
  estimatedRevenue: number;
  actualRevenue: number;
  probability: number;
  stage: string;
  closeDate: string;
  createdOn: string;
  modifiedOn: string;
  ageInDays: number;
  isWon: boolean;
  product: string;
  description?: string;
  nextStep?: string;
  nextStepDueDate?: string;
  timeline?: string;
  contact?: string;
  rating?: string;
  forecastCategory?: string;
}

export interface DashboardData {
  opportunities: Opportunity[];
  quotaTarget: number;
  weeklyActivities: number;
  lastUpdated: string;
}

export interface KPIData {
  label: string;
  value: number;
  format: 'percent' | 'ratio' | 'number' | 'currency';
  trend?: 'up' | 'down' | 'stable';
  sparklineData?: number[];
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}
