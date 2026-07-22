import { useState, useCallback } from 'react';
import { message }               from 'antd';

interface ApiCallState<T> {
  data:     T | null;
  loading:  boolean;
  error:    string | null;
}

export function useApiCall<T>(
  apiFunc: (...args: any[]) => Promise<any>,
  options?: {
    successMessage?: string;
    errorMessage?:   string;
    onSuccess?:      (data: T) => void;
    onError?:        (err: any) => void;
  }
) {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null, loading: false, error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await apiFunc(...args);
        const data = res.data || res;
        setState({ data, loading: false, error: null });
        if (options?.successMessage) {
          message.success(options.successMessage);
        }
        options?.onSuccess?.(data);
        return data;
      } catch (err: any) {
        const errMsg =
          err.response?.data?.message ||
          options?.errorMessage ||
          'Something went wrong';
        setState((prev) => ({
          ...prev, loading: false, error: errMsg,
        }));
        message.error(errMsg);
        options?.onError?.(err);
        return null;
      }
    },
    [apiFunc]
  );

  const reset = () =>
    setState({ data: null, loading: false, error: null });

  return { ...state, execute, reset };
}