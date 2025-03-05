import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Button, type buttonVariants as buttonVariantsValue } from '@/components/ui/button';
import { Slot } from '@radix-ui/react-slot';
import { controlVariants } from './form-variants';
import type { formFieldVariants } from './form-variants';

export interface FormSaveButtonProps extends 
    React.ComponentProps<"button">,
    VariantProps<typeof buttonVariantsValue>,
    VariantProps<typeof formFieldVariants> {
    text?: string;
    asChild?: boolean;
    className?: string;
}

const FormSaveButton = React.forwardRef<HTMLButtonElement, FormSaveButtonProps>(
    ({ text = 'Save', asChild, className, layout, children, ...props }, ref) => {
        const { formState } = useFormContext();
        
        const isDisabled = !formState.isDirty || formState.isSubmitting;
        const Comp = asChild ? Slot : Button;

        return (
            <div className={cn(controlVariants({ layout }), className)}>
                <Comp
                    type="submit"
                    disabled={isDisabled}
                    ref={ref}
                    {...props}
                >
                    {text && text.length > 0 ? text : null}
                    {children}
                </Comp>
            </div>
        );
    }
);

FormSaveButton.displayName = 'FormSaveButton';

export default FormSaveButton; 