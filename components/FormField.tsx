import React from "react";
import {
    FormControl,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface CustomFormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: "text" | "email" | "password";
    description?: string;
}

const CustomFormField = <T extends FieldValues>({
                                                    control,
                                                    name,
                                                    label,
                                                    placeholder = "",
                                                    type = "text",
                                                    description
                                                }: CustomFormFieldProps<T>) => (
    <Controller
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel className="label">{label}</FormLabel>
                <FormControl>
                    <Input type={type} placeholder={placeholder} {...field} />
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
            </FormItem>
        )}
    />
);

export default CustomFormField;
