export interface Expense {
  _id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  paymentMethod: string;
}

export interface TrendData {
  date: string;
  amount: number;
}

export interface CategoryData {
  name: string;
  value: number;
}
export interface Subscription {
  status: string;
  plan: string;
  endDate: string;
  startDate: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  interval: string;
  trialPeriod: string;
  
}