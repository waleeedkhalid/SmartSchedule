"use client";

import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Gavel, PlusCircle } from "lucide-react";

import { schedulerRules } from "@/data/mock";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const categories = [
  { value: "Hard", badge: "bg-red-500/10 text-red-600" },
  { value: "Soft", badge: "bg-blue-500/10 text-blue-600" },
  { value: "Advisory", badge: "bg-amber-500/10 text-amber-700" },
] as const;

type RuleForm = {
  title: string;
  category: "Hard" | "Soft" | "Advisory";
  description: string;
  priority: number;
};

export function SchedulerRules() {
  const [rules, setRules] = React.useState(() => schedulerRules.sort((a, b) => b.priority - a.priority));
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const form = useForm<RuleForm>({
    defaultValues: {
      title: "",
      category: "Hard",
      description: "",
      priority: 3,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setRules((prev) => [
      {
        id: `RULE-${(Math.random() * 10000).toFixed(0)}`,
        title: values.title,
        category: values.category,
        description: values.description,
        priority: Number(values.priority),
        active: true,
        ownerRole: "scheduler",
      },
      ...prev,
    ]);
    setDialogOpen(false);
    form.reset();
  });

  const toggleActive = React.useCallback((id: string) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule)));
  }, []);

  return (
    <Card data-test="scheduler-rules-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Gavel className="size-5 text-primary" aria-hidden="true" />
              Scheduling rules
            </CardTitle>
            <CardDescription>
              Hard rules block generation; soft rules influence scoring. Toggle active status for upcoming cycles.
            </CardDescription>
          </div>
          <Button type="button" onClick={() => setDialogOpen(true)} data-test="rule-create">
            <PlusCircle className="mr-2 size-4" aria-hidden="true" /> New rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 ? (
          <EmptyState
            title="No rules configured"
            description="Create your first scheduling rule to guide the generator."
            actionLabel="Add rule"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Rule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-center">Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} data-test="rule-row">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{rule.title}</span>
                      <Badge variant="outline" className={cn("text-xs", categories.find((cat) => cat.value === rule.category)?.badge)}>
                        {rule.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={rule.active}
                      onCheckedChange={() => toggleActive(rule.id)}
                      data-test="rule-active-toggle"
                    />
                    <span className="text-sm text-muted-foreground">
                      {rule.active ? "Active" : "Paused"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm font-semibold">{rule.priority}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">{rules.length} rules tracked • Last change {new Date().toLocaleDateString()}</CardFooter>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add scheduling rule</DialogTitle>
            <DialogDescription>Describe scope and impact. Hard rules are prioritized above all else.</DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <Form {...form}>
              <form className="space-y-4" onSubmit={onSubmit} data-test="rule-form">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Capstone sections spacing" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl asChild>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Hard rules block scheduling; advisory rules inform scoring.</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    rules={{ min: { value: 1, message: "Min priority is 1" }, max: { value: 5, message: "Max priority is 5" } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority (1–5)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Detail the policy or operational rule to observe." className="min-h-28" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={form.formState.isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : "Save rule"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
