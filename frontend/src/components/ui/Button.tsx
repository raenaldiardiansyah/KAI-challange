import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      primary: "button-primary",
      secondary: "button-secondary",
      ghost: "button-ghost"
    }
  },
  defaultVariants: {
    variant: "primary"
  }
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
  icon?: ReactNode;
  asChild?: boolean;
};

export function Button({ children, icon, variant, asChild = false, className, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp className={cn(buttonVariants({ variant }), className)} type={asChild ? undefined : "button"} {...props}>
      {icon}
      {children && <span>{children}</span>}
    </Comp>
  );
}
