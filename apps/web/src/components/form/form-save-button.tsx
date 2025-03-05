import React from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { SaveIcon, RefreshCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slot } from '@radix-ui/react-slot';

export interface FormSaveButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  loadingText?: string;
  saveText?: string;
  changedText?: string;
  className?: string;
}

const FormSaveButton = React.forwardRef<HTMLButtonElement, FormSaveButtonProps>(
  ({ 
    asChild = false, 
    loadingText = "Saving...", 
    saveText = "Save", 
    changedText = "Save Changes",
    className,
    ...props 
  }, ref) => {
    const { formState } = useFormContext();
    const { isDirty, isSubmitting } = formState;
    
    const Comp = asChild ? Slot : Button;
    
    return (
      <Comp
        type="submit"
        disabled={isSubmitting || (!isDirty && !props.disabled)}
        className={cn("flex items-center gap-2", className)}
        ref={ref}
        {...props}
      >
        {isSubmitting ? (
          <>
            <RefreshCcwIcon className="h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : isDirty ? (
          <>
            <SaveIcon className="h-4 w-4 text-green-500" />
            {changedText}
          </>
        ) : (
          <>
            <SaveIcon className="h-4 w-4" />
            {saveText}
          </>
        )}
      </Comp>
    );
  }
);

FormSaveButton.displayName = 'FormSaveButton';

export default FormSaveButton; 