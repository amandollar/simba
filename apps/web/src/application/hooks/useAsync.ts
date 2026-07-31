import { useCallback, useEffect, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}

export function useMutation<TArgs extends unknown[], TResult>(
  mutator: (...args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutator(...args);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutator]
  );

  return { mutate, loading, error };
}
