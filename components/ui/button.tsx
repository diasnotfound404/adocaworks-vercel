import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Estilo mais limpo e Material Design-like
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-md text-sm",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
        outline:
          "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200",
        secondary:
          "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400",
        ghost:
          "bg-transparent text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200",
        link: "text-blue-600 hover:underline underline-offset-4",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
