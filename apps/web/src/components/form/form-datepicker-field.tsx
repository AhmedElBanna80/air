import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import React from 'react';
import type { FieldValues, Path } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { controlVariants, formFieldVariants, labelVariants, messageVariants } from './form-variants';

export interface FormDatePickerProps<T extends FieldValues> extends VariantProps<typeof formFieldVariants> {
    name: Path<T>;
    labelText: string;
    placeholder?: string;
    className?: string;
    datePickerClassName?: string;
    dateFormat?: string;
}

const FormDatePicker = React.forwardRef(
    <T extends FieldValues>({ 
        name, 
        labelText, 
        placeholder = "Select a date", 
        layout, 
        className,
        datePickerClassName,
        dateFormat = "MMM d, yyyy"
    }: FormDatePickerProps<T>, ref: React.ForwardedRef<HTMLButtonElement>) => {
        const { control } = useFormContext<T>();

        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn(formFieldVariants({ layout }), className)}>
                        {labelText && <FormLabel className={labelVariants({ layout })}>{labelText}</FormLabel>}
                        <FormControl className={controlVariants({ layout })}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-background text-foreground",
                                            !field.value && "text-muted-foreground",
                                            datePickerClassName
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                        {field.value ? (
                                            format(field.value, dateFormat)
                                        ) : (
                                            <span>{placeholder}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}  
                                        onSelect={field.onChange}
                                        initialFocus
                                        className="rounded-md border shadow-sm"
                                    />
                                </PopoverContent>
                            </Popover>
                        </FormControl>
                        <FormMessage className={messageVariants({ layout })} />
                    </FormItem>
                )}
            />
        );
    },
);

FormDatePicker.displayName = 'FormDatePicker';

export default FormDatePicker as unknown as <T extends FieldValues>(
    props: FormDatePickerProps<T> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
