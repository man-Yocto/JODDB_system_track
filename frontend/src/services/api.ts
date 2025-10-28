// API Service Layer for JODDB Backend Integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    role: string;
    full_name: string;
  };
}

export interface Task {
  id: number;
  job_order: number;
  device: number;
  device_serial?: string;
  operation_name: string;
  standard_time_seconds: number;
  actual_time_seconds?: number;
  efficiency?: number;
  status: string;
  technician?: number;
  technician_name?: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface JobOrder {
  id: number;
  order_code: string;
  title: string;
  description?: string;
  total_devices: number;
  due_date: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface JobOrderProgress {
  progress_percent: number;
  total_completed: number;
  total_rejected: number;
  total_devices: number;
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
}

export interface TechnicianMetrics {
  technician_id: number;
  technician_name: string;
  date: string;
  productivity: number;
  efficiency: number;
  utilization: number;
  total_tasks_completed: number;
  total_standard_time: number;
  total_actual_time: number;
}

export interface Inspection {
  id: number;
  task: number;
  device: number;
  inspector: number | null;
  decision: 'accepted' | 'rejected';
  comments: string;
  created_at: string;
}

// Error handling
class APIError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.error || JSON.stringify(errorData);
    } catch {
      // If JSON parsing fails, use the default error message
    }
    throw new APIError(response.status, errorMessage);
  }
  return response.json();
}

// Handle paginated responses from DRF
async function handlePaginatedResponse<T>(response: Response): Promise<T[]> {
  const data = await handleResponse<any>(response);
  // If response has 'results' key (paginated), return results array
  // Otherwise, assume it's already an array
  return Array.isArray(data) ? data : (data?.results || []);
}

// =======================
// Authentication APIs
// =======================

export const authAPI = {
  /**
   * Login user and get JWT tokens
   * POST /api/v1/auth/login/
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await handleResponse<LoginResponse>(response);
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/token/refresh/
   */
  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await handleResponse<{ access: string }>(response);
    localStorage.setItem('access_token', data.access);
    
    return data;
  },

  /**
   * Logout and blacklist refresh token
   * POST /api/v1/auth/logout/
   */
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// =======================
// Task APIs (Technician)
// =======================

export const taskAPI = {
  /**
   * Get all tasks (filtered by role on backend)
   * GET /api/v1/tasks/
   */
  getTasks: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/tasks/`, {
      headers: getAuthHeaders(),
    });
    return handlePaginatedResponse<Task>(response);
  },

  /**
   * Get single task details
   * GET /api/v1/tasks/{id}/
   */
  getTask: async (taskId: number): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Start a task (Technician)
   * PATCH /api/v1/tasks/{id}/start/
   */
  startTask: async (taskId: number): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}/start/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse<Task>(response);
  },

  /**
   * End a task (Technician)
   * PATCH /api/v1/tasks/{id}/end/
   */
  endTask: async (taskId: number, notes?: string): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}/end/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes: notes || '' }),
    });
    return handleResponse<Task>(response);
  },
};

// =======================
// Job Order APIs
// =======================

export const jobOrderAPI = {
  /**
   * Get all job orders
   * GET /api/v1/job-orders/
   */
  getJobOrders: async (): Promise<JobOrder[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-orders/`, {
      headers: getAuthHeaders(),
    });
    return handlePaginatedResponse<JobOrder>(response);
  },

  /**
   * Get single job order details
   * GET /api/v1/job-orders/{id}/
   */
  getJobOrder: async (jobOrderId: number): Promise<JobOrder> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-orders/${jobOrderId}/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<JobOrder>(response);
  },

  /**
   * Create new job order (Planning Engineer)
   * POST /api/v1/job-orders/
   */
  createJobOrder: async (data: {
    order_code: string;
    title: string;
    description?: string;
    due_date: string;
    standard_time_seconds: number;
    device_serials: string[];
  }): Promise<JobOrder> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/job-orders/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<JobOrder>(response);
  },

  /**
   * Import job orders from Excel/CSV (Planning Engineer)
   * POST /api/v1/data/import/job-order/
   */
  importJobOrders: async (file: File): Promise<{
    success: boolean;
    summary: {
      total_job_orders_created: number;
      total_devices_created: number;
      created_job_orders: string[];
      duplicates: string[];
      errors: string[];
    };
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/v1/data/import/job-order/`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return handleResponse(response);
  },
};

// =======================
// Metrics APIs
// =======================

export const metricsAPI = {
  /**
   * Get technician daily metrics
   * GET /api/v1/metrics/technician/{id}/?date=YYYY-MM-DD
   */
  getTechnicianMetrics: async (
    technicianId: number,
    date?: string
  ): Promise<TechnicianMetrics> => {
    const dateParam = date ? `?date=${date}` : '';
    const response = await fetch(
      `${API_BASE_URL}/api/v1/metrics/technician/${technicianId}/${dateParam}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<TechnicianMetrics>(response);
  },

  /**
   * Get job order progress and alerts
   * GET /api/v1/metrics/job-order/{id}/
   */
  getJobOrderProgress: async (jobOrderId: number): Promise<JobOrderProgress> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/metrics/job-order/${jobOrderId}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<JobOrderProgress>(response);
  },
};

// =======================
// Inspection APIs (Quality Inspector)
// =======================

export const inspectionAPI = {
  /**
   * Create inspection (accept/reject task)
   * POST /api/v1/inspections/
   */
  createInspection: async (data: {
    task_id: number;
    decision: 'accepted' | 'rejected';
    comments: string;
  }): Promise<Inspection> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/inspections/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Inspection>(response);
  },

  /**
   * Get all inspections
   * GET /api/v1/inspections/
   */
  getInspections: async (): Promise<Inspection[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/inspections/`, {
      headers: getAuthHeaders(),
    });
    return handlePaginatedResponse<Inspection>(response);
  },
};

// =======================
// Export APIs
// =======================

export const exportAPI = {
  /**
   * Export daily report
   * GET /api/v1/data/export/daily-report/?date=YYYY-MM-DD&format=csv
   */
  exportDailyReport: async (date?: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    params.append('format', format);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/data/export/daily-report/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new APIError(response.status, 'Failed to export report');
    }

    return response.blob();
  },
};

// Export all APIs
export const api = {
  auth: authAPI,
  tasks: taskAPI,
  jobOrders: jobOrderAPI,
  metrics: metricsAPI,
  inspections: inspectionAPI,
  export: exportAPI,
};

export default api;
