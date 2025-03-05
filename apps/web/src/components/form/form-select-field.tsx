import React from 'react';
import { type Path, useFormContext } from 'react-hook-form';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export type FormSelectFieldOptions = {
    value: string;
    label: string;
};

export interface FromSelectFieldProps<T> extends VariantProps<typeof formFieldVariants> {
    name: keyof T;
    options: FormSelectFieldOptions[];
    placeholder: string;
    labelText: string;
    className?: string;
    selectClassName?: string;
}

const FormSelectField = React.forwardRef(
    <T extends object>({ 
        name, 
        options, 
        labelText, 
        placeholder, 
        layout, 
        className,
        selectClassName
    }: FromSelectFieldProps<T>, ref: any) => {
        const { control } = useFormContext<T>();

        return (
            <FormField
                control={control}
                name={name as unknown as Path<T>}
                render={({ field }) => (
                    <FormItem className={cn(formFieldVariants({ layout }), className)}>
                        <FormLabel className={labelVariants({ layout })}>{labelText}</FormLabel>
                        <FormControl className={controlVariants({ layout })}>
                            <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                value={field.value}
                            >
                                <SelectTrigger id="currency" className={selectClassName}>
                                    <SelectValue placeholder={placeholder} />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectGroup>
                                        {options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage className={cn(
                            "text-red-500", 
                            layout === 'horizontal' ? "ml-[120px]" : "mt-1 w-full"
                        )} data-testid="captcha-error" />
                    </FormItem>
                )}
            />
        );
    },
);

FormSelectField.displayName = 'FormSelectField';

export default FormSelectField as unknown as <T extends object>(
    props: FromSelectFieldProps<T> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
