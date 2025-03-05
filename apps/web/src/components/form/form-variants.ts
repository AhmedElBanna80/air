import { cva } from 'class-variance-authority';

// Define the form field layout variants
export const formFieldVariants = cva('w-full', {
    variants: {
        layout: {
            vertical: 'flex flex-col',
            horizontal: 'flex flex-row items-center gap-2'
        }
    },
    defaultVariants: {
        layout: 'vertical'
    }
});

// Define the label variants
export const labelVariants = cva('text-sm font-medium', {
    variants: {
        layout: {
            vertical: 'mb-2',
            horizontal: 'min-w-[70px] whitespace-nowrap mb-0'
        }
    },
    defaultVariants: {
        layout: 'vertical'
    }
});

// Define the control variants
export const controlVariants = cva('', {
    variants: {
        layout: {
            vertical: 'w-full',
            horizontal: 'flex-1'
        }
    },
    defaultVariants: {
        layout: 'vertical'
    }
});

// Define the message variants
export const messageVariants = cva('text-sm text-destructive', {
    variants: {
        layout: {
            vertical: 'mt-1',
            horizontal: 'ml-[70px] mt-0'
        }
    },
    defaultVariants: {
        layout: 'vertical'
    }
}); 