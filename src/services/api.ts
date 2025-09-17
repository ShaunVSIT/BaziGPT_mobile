import axios from 'axios';

// Base URL for your existing Vercel deployment
const BASE_URL = 'https://www.bazigpt.io/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Types aligned to web API =====
export interface BaziReadingRequest {
  birthDate: string;
  birthTime: string;
  timezone?: string;
  language?: string;
}

export interface BaziReadingResponse {
  reading: string;
  shareableSummary?: string;
  yearPillar?: string;
  monthPillar?: string;
  dayPillar?: string;
  hourPillar?: string;
  elements?: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

export interface CompatibilityRequest {
  person1: {
    birthDate: string;
    birthTime: string;
    language?: string;
  };
  person2: {
    birthDate: string;
    birthTime: string;
    language?: string;
  };
}

export interface CompatibilityResponse {
  reading: string;
  shareableSummary?: string;
}

export interface DailyGeneralForecastResponse {
  date: string;
  baziPillar: string;
  forecast: string;
  error?: string;
}

export interface PersonalForecastRequest {
  birthDate: string;
  birthTime?: string;
  language?: string;
}

export interface PersonalForecastResponse {
  todayPillar: string;
  personalForecast: string;
  cached: boolean;
  error?: string;
}

export interface BaziFollowupRequest {
  birthDate: string;
  question: string;
  language?: string;
}

export interface BaziFollowupResponse {
  content: string;
}

export interface FamousPerson {
  id?: string;
  name: string;
  slug: string;
  category?: string;
  bio?: string;
  image_url?: string;
  birth_date?: string;
  birth_time?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  threads_handle?: string;
  website?: string;
  bazi_reading?: string;
  marketing_blurb?: string;
}

export interface FamousListResponse {
  data: FamousPerson[];
  total: number;
  limit: number;
  offset: number;
}

// ===== API Functions =====
export const baziApi = {
  // Get Bazi Reading
  getBaziReading: async (data: BaziReadingRequest): Promise<BaziReadingResponse> => {
    const response = await api.post('/bazi-reading', data);
    return response.data;
  },

  // Follow-up question on Bazi
  getBaziFollowup: async (data: BaziFollowupRequest): Promise<BaziFollowupResponse> => {
    const response = await api.post('/bazi-followup', data);
    return response.data;
  },

  // Get Compatibility Analysis
  getCompatibility: async (data: CompatibilityRequest): Promise<CompatibilityResponse> => {
    // Web API expects flat keys, not nested objects
    const payload = {
      person1BirthDate: data.person1.birthDate,
      person1BirthTime: data.person1.birthTime,
      person2BirthDate: data.person2.birthDate,
      person2BirthTime: data.person2.birthTime,
    } as const;
    const response = await api.post('/bazi-compatibility', payload);
    return response.data;
  },

  // Get General Daily Forecast (no user info)
  getDailyGeneralForecast: async (params?: { language?: string; date?: string }): Promise<DailyGeneralForecastResponse> => {
    const response = await api.get('/daily-bazi', {
      params: {
        lang: params?.language,
        date: params?.date,
      },
    });
    return response.data;
  },

  // Health/status for daily-bazi API
  getDailyBaziStatus: async (): Promise<{ status: string; timestamp: string; message: string; environment: string }> => {
    const response = await api.get('/daily-bazi-status');
    return response.data;
  },

  // Get Daily Personal Forecast
  getDailyPersonalForecast: async (data: PersonalForecastRequest): Promise<PersonalForecastResponse> => {
    const response = await api.post('/daily-personal-forecast', data);
    return response.data;
  },

  // Get Famous Person list (server-filtered)
  getFamousPersons: async (params?: { search?: string; category?: string; limit?: number; offset?: number }): Promise<FamousListResponse> => {
    const response = await api.get('/famous', {
      params,
    });
    return response.data;
  },

  // Get Famous Person by Slug
  getFamousPerson: async (slug: string): Promise<FamousPerson> => {
    const response = await api.get(`/famous/${slug}`);
    return response.data;
  },

  // Get Famous Categories
  getFamousCategories: async (): Promise<{ categories: string[] }> => {
    const response = await api.get('/famous/categories');
    return response.data;
  },
};

export default api;
