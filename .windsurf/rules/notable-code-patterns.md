---
trigger: always_on
---

# Notable Code Patterns

## Component Patterns

### Basic Component Template

```tsx
interface Props {
  title: string;
  onAction: () => void;
  children?: React.ReactNode;
}

export const Component = memo(function Component({
  title,
  onAction,
  children,
}: Props) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
});
```

### Hook Pattern

```tsx
function useCustomHook(param: string) {
  const [state, setState] = useState<string>(param);

  useEffect(() => {
    // Side effect logic
  }, [param]);

  return { state };
}
```

## Common Utility Functions

### Type Guards

```tsx
function isError(value: unknown): value is Error {
  return value instanceof Error;
}
```

### Data Transformers

```tsx
function transformData<T, R>(data: T[], transform: (item: T) => R): R[] {
  return data.map(transform);
}
```

## Error Handling Patterns

### Error Boundary

```tsx
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Async Error Handler

```tsx
async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(error);
    return fallback;
  }
}
```

## State Management Patterns

### Context Provider

```tsx
export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const value = useMemo(
    () => ({
      state,
      setState,
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

### Custom Hook with Loading State

```tsx
function useDataFetching<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error };
}
```
