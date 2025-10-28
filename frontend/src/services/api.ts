// API Service Layer for JODDB Backend Integration
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in all requests
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Types
export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
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

// Handle API responses (Axios version)
function handleResponse<T>(response: any): T {
  return response.data;
}

// Handle paginated responses from DRF (Axios version)
function handlePaginatedResponse<T>(response: any): T[] {
  const data = response.data;
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
    const response = await axiosInstance.post('/api/v1/auth/login/', { username, password });
    const data = response.data;
    
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

    const response = await axiosInstance.post('/api/v1/auth/token/refresh/', {
      refresh: refreshToken,
    });

    const data = response.data;
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
        await axiosInstance.post('/api/v1/auth/logout/', {
          refresh: refreshToken,
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
    const response = await axiosInstance.get('/api/v1/tasks/');
    return handlePaginatedResponse<Task>(response);
  },

  /**
   * Get single task details
   * GET /api/v1/tasks/{id}/
   */
  getTask: async (taskId: number): Promise<Task> => {
    const response = await axiosInstance.get(`/api/v1/tasks/${taskId}/`);
    return handleResponse<Task>(response);
  },

  /**
   * Start a task (Technician)
   * PATCH /api/v1/tasks/{id}/start/
   */
  startTask: async (taskId: number): Promise<Task> => {
    const response = await axiosInstance.patch(`/api/v1/tasks/${taskId}/start/`);
    return handleResponse<Task>(response);
  },

  /**
   * End a task (Technician)
   * PATCH /api/v1/tasks/{id}/end/
   */
  endTask: async (taskId: number, notes?: string): Promise<Task> => {
    const response = await axiosInstance.patch(`/api/v1/tasks/${taskId}/end/`, {
      notes: notes || '',
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
    const response = await axiosInstance.get('/api/v1/job-orders/');
    return handlePaginatedResponse<JobOrder>(response);
  },

  /**
   * Get single job order details
   * GET /api/v1/job-orders/{id}/
   */
  getJobOrder: async (jobOrderId: number): Promise<JobOrder> => {
    const response = await axiosInstance.get(`/api/v1/job-orders/${jobOrderId}/`);
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
    const response = await axiosInstance.post('/api/v1/job-orders/', data);
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

    const response = await axiosInstance.post('/api/v1/data/import/job-order/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
    const response = await axiosInstance.get(
      `/api/v1/metrics/technician/${technicianId}/${dateParam}`
    );
    return handleResponse<TechnicianMetrics>(response);
  },

  /**
   * Get job order progress and alerts
   * GET /api/v1/metrics/job-order/{id}/
   */
  getJobOrderProgress: async (jobOrderId: number): Promise<JobOrderProgress> => {
    const response = await axiosInstance.get(
      `/api/v1/metrics/job-order/${jobOrderId}/`
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
    const response = await axiosInstance.post('/api/v1/inspections/', data);
    return handleResponse<Inspection>(response);
  },

  /**
   * Get all inspections
   * GET /api/v1/inspections/
   */
  getInspections: async (): Promise<Inspection[]> => {
    const response = await axiosInstance.get('/api/v1/inspections/');
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

    const response = await axiosInstance.get(
      `/api/v1/data/export/daily-report/?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
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
