import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

export type CookieStore = {
  getAll: () => { name: string; value: string }[];
  set?: (
    name: string,
    value: string,
    options?: Record<string, unknown>
  ) => void;
};

export function createServerClient(cookieStore: CookieStore) {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set?.(name, value, options);
            } catch {
              // Ignore if cookies cannot be set in this context
            }
          });
        },
      },
    }
  );
}
