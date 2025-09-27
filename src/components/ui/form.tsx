import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const Form = FormProvider;

const FormFieldContext = React.createContext<{ name: string } | undefined>(undefined);
const FormItemContext = React.createContext<{ id: string } | undefined>(undefined);

const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  render,
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: name as string }}>
      <Controller control={control} name={name} render={render} />
    </FormFieldContext.Provider>
  );
};

const useFormFieldContext = () => {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error("Form components must be used within a <FormField>");
  }
  return context;
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const useFormItemContext = () => {
  const context = React.useContext(FormItemContext);
  if (!context) {
    throw new Error("useFormItemContext must be used within <FormItem />");
  }
  return context;
};

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    const { id } = useFormItemContext();
    return <label ref={ref} className={cn("text-sm font-medium", className)} htmlFor={id} {...props} />;
  },
);
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ className, ...props }, ref) => {
    const { id } = useFormItemContext();
    return <Slot ref={ref} id={id} className={className} {...props} />;
  },
);
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    useFormItemContext();
    const { name } = useFormFieldContext();
    const form = useFormContext();
    const error = name ? form.formState.errors[name] : undefined;
    const body = error ? String((error as { message?: string }).message ?? "") : children;

    if (!body) return null;

    return (
      <p ref={ref} className={cn("text-xs text-destructive", className)} {...props}>
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage };
