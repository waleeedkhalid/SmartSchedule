import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = TabsPrimitive.List;

const TabsTrigger = TabsPrimitive.Trigger;

const TabsContent = TabsPrimitive.Content;

const StyledTabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsList>) => (
  <TabsList className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />
);

const StyledTabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsTrigger>) => (
  <TabsTrigger
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className,
    )}
    {...props}
  />
);

const StyledTabsContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsContent>) => (
  <TabsContent className={cn("mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />
);

export { Tabs, StyledTabsContent as TabsContent, StyledTabsList as TabsList, StyledTabsTrigger as TabsTrigger };
