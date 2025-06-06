export interface OrgFormData {
  name: string;
  email: string;
  sector: string[];
  locations: string[];
  customerLocations: string[];
  dataTypes: string[];
  infrastructure: string[];
  customerType: string;
  orgSize: string;
  revenue: string;
}

export interface SignupFormData extends OrgFormData {
  password: string;
  recommendations: {
    required: string[];
    recommended: string[];
  };
} 