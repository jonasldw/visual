// API Client for Visual CRM FastAPI Backend

// TypeScript interfaces matching Pydantic models
export type CustomerStatus = 'aktiv' | 'inaktiv' | 'interessent' | 'archiviert';
export type InsuranceType = 'gesetzlich' | 'privat' | 'selbstzahler';
export type ProductType = 'frame' | 'lens' | 'contact_lens' | 'accessory';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'insurance_pending' | 'cancelled';

export interface CustomerBase {
  organization_id?: number;
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

// Product interfaces
export interface ProductBase {
  organization_id?: number;
  product_type: ProductType;
  sku?: string;
  name: string;
  brand?: string;
  model?: string;
  frame_size?: string;
  frame_color?: string;
  lens_material?: string;
  lens_coating?: Record<string, unknown>;
  details?: Record<string, unknown>;
  current_price: number;
  vat_rate?: number;
  insurance_eligible?: boolean;
  active?: boolean;
}

export interface Product extends ProductBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export type ProductCreate = ProductBase;
export type ProductUpdate = Partial<ProductBase>;

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// Invoice Item interfaces
export interface InvoiceItemBase {
  product_id?: number;
  product_snapshot: Record<string, unknown>;
  prescription_values?: Record<string, unknown>;
  quantity?: number;
  unit_price: number;
  discount_amount?: number;
  vat_rate: number;
  line_total: number;
  insurance_covered?: boolean;
}

export interface InvoiceItem extends InvoiceItemBase {
  id: number;
  invoice_id: number;
  created_at: string;
}

export type InvoiceItemCreate = InvoiceItemBase;
export type InvoiceItemUpdate = Partial<InvoiceItemBase>;

// Invoice interfaces
export interface InvoiceBase {
  organization_id?: number;
  customer_id: number;
  invoice_date?: string;
  due_date?: string;
  prescription_snapshot?: Record<string, unknown>;
  insurance_provider?: string;
  insurance_claim_number?: string;
  insurance_coverage_amount?: number;
  patient_copay_amount?: number;
  status?: InvoiceStatus;
  payment_method?: string;
  notes?: string;
}

export interface Invoice extends InvoiceBase {
  id: number;
  invoice_number: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface InvoiceCreate extends InvoiceBase {
  items?: InvoiceItemCreate[];
}

export type InvoiceUpdate = Partial<InvoiceBase>;

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
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
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

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
      body: JSON.stringify(customer),
    });
  },

  // Update existing customer
  update: async (id: number, customer: CustomerUpdate): Promise<Customer> => {
    return request<Customer>(`/api/v1/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
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

// Product API endpoints
export const productApi = {
  // Get all products with optional pagination and filtering
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    product_type?: ProductType;
    active_only?: boolean;
    search?: string;
    organization_id?: number;
  }): Promise<ProductListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.product_type) searchParams.append('product_type', params.product_type);
    if (params?.active_only !== undefined) searchParams.append('active_only', params.active_only.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.organization_id) searchParams.append('organization_id', params.organization_id.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/products${queryString ? `?${queryString}` : ''}`;
    
    return request<ProductListResponse>(endpoint);
  },

  // Get product by ID
  getById: async (id: number, organization_id = 1): Promise<Product> => {
    return request<Product>(`/api/v1/products/${id}?organization_id=${organization_id}`);
  },

  // Create new product
  create: async (product: ProductCreate): Promise<Product> => {
    return request<Product>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  // Update existing product
  update: async (id: number, product: ProductUpdate, organization_id = 1): Promise<Product> => {
    return request<Product>(`/api/v1/products/${id}?organization_id=${organization_id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  // Delete product (soft delete)
  delete: async (id: number, organization_id = 1): Promise<void> => {
    return request<void>(`/api/v1/products/${id}?organization_id=${organization_id}`, {
      method: 'DELETE',
    });
  },
};

// Invoice API endpoints
export const invoiceApi = {
  // Get all invoices with optional pagination and filtering
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: InvoiceStatus;
    customer_id?: number;
    date_from?: string;
    date_to?: string;
    organization_id?: number;
  }): Promise<InvoiceListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.customer_id) searchParams.append('customer_id', params.customer_id.toString());
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.organization_id) searchParams.append('organization_id', params.organization_id.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/api/v1/invoices${queryString ? `?${queryString}` : ''}`;
    
    return request<InvoiceListResponse>(endpoint);
  },

  // Get invoice by ID with items
  getById: async (id: number, organization_id = 1): Promise<InvoiceWithItems> => {
    return request<InvoiceWithItems>(`/api/v1/invoices/${id}?organization_id=${organization_id}`);
  },

  // Create new invoice with items
  create: async (invoice: InvoiceCreate): Promise<InvoiceWithItems> => {
    return request<InvoiceWithItems>('/api/v1/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  },

  // Update existing invoice
  update: async (id: number, invoice: InvoiceUpdate, organization_id = 1): Promise<InvoiceWithItems> => {
    return request<InvoiceWithItems>(`/api/v1/invoices/${id}?organization_id=${organization_id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  },

  // Delete invoice
  delete: async (id: number, organization_id = 1): Promise<void> => {
    return request<void>(`/api/v1/invoices/${id}?organization_id=${organization_id}`, {
      method: 'DELETE',
    });
  },

  // Add item to invoice
  addItem: async (invoiceId: number, item: InvoiceItemCreate, organization_id = 1): Promise<InvoiceItem> => {
    return request<InvoiceItem>(`/api/v1/invoices/${invoiceId}/items?organization_id=${organization_id}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // Update invoice item
  updateItem: async (invoiceId: number, itemId: number, item: InvoiceItemUpdate, organization_id = 1): Promise<InvoiceItem> => {
    return request<InvoiceItem>(`/api/v1/invoices/${invoiceId}/items/${itemId}?organization_id=${organization_id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  // Delete invoice item
  deleteItem: async (invoiceId: number, itemId: number, organization_id = 1): Promise<void> => {
    return request<void>(`/api/v1/invoices/${invoiceId}/items/${itemId}?organization_id=${organization_id}`, {
      method: 'DELETE',
    });
  },
};

// Main API object
export const api = {
  customers: customerApi,
  products: productApi,
  invoices: invoiceApi,
  health: healthApi,
};

export default api;