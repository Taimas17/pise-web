import { useState } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    apiCall: () => Promise<any>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (data: T) => void;
      onError?: (error: AxiosError) => void;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      if (options?.onSuccess) {
        options.onSuccess(response.data);
      }
      return response.data as T;
    } catch (err: any) {
      const message = err?.response?.data?.message || options?.errorMessage || 'Une erreur est survenue';
      setError(message);
      if (options?.onError) {
        options.onError(err);
      } else {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
}
