// API Client for Visual CRM FastAPI Backend

// TypeScript interfaces matching Pydantic models
export type CustomerStatus = 'aktiv' | 'inaktiv' | 'interessent' | 'archiviert';
export type InsuranceType = 'gesetzlich' | 'privat' | 'selbstzahler';

export interface CustomerBase {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  date_of_birth?: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
  insurance_provider?: string;
  insurance_type?: InsuranceType;
  insurance_number?: string;
  last_exam_date?: string;
  next_appointment?: string;
  prescription_sphere_right?: number;
  prescription_sphere_left?: number;
  prescription_cylinder_right?: number;
  prescription_cylinder_left?: number;
  prescription_axis_right?: number;
  prescription_axis_left?: number;
  prescription_addition?: number;
  prescription_pd?: number;
  allergies?: string;
  medical_notes?: string;
  frame_preferences?: string;
  contact_preference?: string;
  status: CustomerStatus;
}

export interface Customer extends CustomerBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export type CustomerCreate = CustomerBase

export type CustomerUpdate = Partial<CustomerBase>

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// API Error interface
export interface ApiError {
  detail: string;
  status: number;
}

// API Client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

console.log('🔧 API Client initialized with base URL:', API_BASE_URL);

// Generic request function with error handling
async function request<T>(
  endpoint: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add body serialization for POST/PUT requests
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  console.log('🌐 Making API request:', { url, method: config.method || 'GET', body: config.body });
  
  try {
    const response = await fetch(url, config);
    console.log('📡 API Response:', { status: response.status, statusText: response.statusText, url });
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        console.error('💥 API Error Response:', errorData);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // If JSON parsing fails, use the default message
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty responses (e.g., DELETE)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    // Network errors, timeout, etc.
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// Customer API endpoints
export const customerApi = {
  // Get all customers with optional pagination and filtering
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    status?: CustomerStatus;
    search?: string;
  }): Promise<CustomerListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/customers${queryString ? `?${queryString}` : ''}`;
    
    return request<CustomerListResponse>(endpoint);
  },

  // Get customer by ID
  getById: async (id: number): Promise<Customer> => {
    return request<Customer>(`/api/v1/customers/${id}`);
  },

  // Create new customer
  create: async (customer: CustomerCreate): Promise<Customer> => {
    return request<Customer>('/api/v1/customers', {
      method: 'POST',
      body: customer,
    });
  },

  // Update existing customer
  update: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    return request<Customer>(`/api/v1/customers/${id}`, {
      method: 'PUT',
      body: customer,
    });
  },

  // Delete customer (soft delete)
  delete: async (id: number): Promise<void> => {
    return request<void>(`/api/v1/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Health check endpoint for testing connectivity
export const healthApi = {
  check: async (): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>('/api/v1/health');
  },
};

// Main API object
export const api = {
  customers: customerApi,
  health: healthApi,
};

export default api;