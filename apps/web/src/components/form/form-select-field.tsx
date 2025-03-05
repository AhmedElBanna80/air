import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import React, { useCallback } from 'react';
import type { FieldValues, Path } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { controlVariants, formFieldVariants, labelVariants, messageVariants } from './form-variants';

export type SelectOption = {
    value: string;
    label: string;
};

export interface FormSelectFieldProps<T extends FieldValues> extends VariantProps<typeof formFieldVariants> {
    name: Path<T>;
    labelText: string;
    options: SelectOption[];
    placeholder?: string;
    defaultValue?: string;
    className?: string;
}

const FormSelectField = <T extends FieldValues>({
    name,
    labelText,
    options,
    placeholder = 'Select an option',
    defaultValue,
    layout,
    className,
}: FormSelectFieldProps<T>) => {
    const { control } = useFormContext<T>();

    const handleRenderSelectItems = useCallback(
        () =>
            options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                    {option.label}
                </SelectItem>
            )),
        [options]
    );

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn(formFieldVariants({ layout }), className)}>
                    {labelText && <FormLabel className={labelVariants({ layout })}>{labelText}</FormLabel>}
                    <FormControl className={controlVariants({ layout })}>
                        <Select
                            defaultValue={defaultValue}
                            onValueChange={field.onChange}
                            value={field.value}
                        >
                            <SelectTrigger className="w-full bg-background text-foreground">
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                                <SelectGroup>
                                    {handleRenderSelectItems()}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage className={messageVariants({ layout })} data-testid="captcha-error" />
                </FormItem>
            )}
        />
    );
};

export default FormSelectField;
