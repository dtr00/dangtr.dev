import { DefaultOptions, isServer, QueryClient } from "@tanstack/react-query";

const options: DefaultOptions = {
  queries: {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  },
};

export const serverQueryClient = new QueryClient({
  defaultOptions: options,
});

// default client-side query client
let webQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return serverQueryClient;
  } else {
    if (!webQueryClient) {
      webQueryClient = new QueryClient({
        defaultOptions: options,
      });
    }
    return webQueryClient;
  }
}
