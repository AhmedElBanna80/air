import React from 'react';
import { type Path, useFormContext } from 'react-hook-form';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

// Define the form field layout variants
const formFieldVariants = cva('w-full', {
    variants: {
        layout: {
            vertical: 'flex flex-col',
            horizontal: 'flex flex-row items-center gap-4'
        }
    },
    defaultVariants: {
        layout: 'vertical'
    }
});

// Define the label variants
const labelVariants = cva('text-base', {
    variants: {
        layout: {
            vertical: 'mb-2',
            horizontal: 'min-w-[120px] mb-0'
        }
    },
    defaultVariants: {
        layout: 'vertical'
    }
});

// Define the control variants
const controlVariants = cva('', {
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

export interface FormDatePickerProps<T> extends VariantProps<typeof formFieldVariants> {
    name: keyof T;
    labelText: string;
    placeholder?: string;
    className?: string;
    datePickerClassName?: string;
}

const FormDatePicker = React.forwardRef(
    <T extends object>({ 
        name, 
        labelText, 
        placeholder = "Select a date", 
        layout, 
        className,
        datePickerClassName
    }: FormDatePickerProps<T>, ref: any) => {
        const { control } = useFormContext<T>();

        return (
            <FormField
                control={control}
                name={name as unknown as Path<T>}
                render={({ field }) => (
                    <FormItem className={cn(formFieldVariants({ layout }), className)}>
                        <FormLabel className={labelVariants({ layout })}>{labelText}</FormLabel>
                        <FormControl className={controlVariants({ layout })}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                            datePickerClassName
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>{placeholder}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage className={cn(
                            "text-red-500", 
                            layout === 'horizontal' ? "ml-[120px]" : "mt-1 w-full"
                        )} />
                    </FormItem>
                )}
            />
        );
    },
);

FormDatePicker.displayName = 'FormDatePicker';

export default FormDatePicker as unknown as <T extends object>(
    props: FormDatePickerProps<T> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
