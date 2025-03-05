import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";
import FormDatePicker from "./form-datepicker-field";
import FormSelectField from "./form-select-field";
import FormSaveButton from "./form-save-button";


// this is a compound component for form to easily extend with subcomponents
// example:
// const schema = z.object({
//   from: z.date(),
//   to: z.date(),
//   groupBy: z.string(),
// })
// const form = useForm<z.infer<typeof schema>>({
//   resolver: zodResolver(schema),
// })
// const Form = Form as FormComponentType<z.infer<typeof schema>>
// <Form>
//   <Form.DatePickerField labelText="From" name="from" />
//   <Form.DatePickerField labelText="To" name="to" />
//   <Form.SelectField labelText="Group By" name="groupBy" options={[]} placeholder="Select a group" />
//   <Form.SaveButton asChild>
//     <Button type="submit">Save</Button>
//   </Form.SaveButton>
// </Form>
type FormProps<TFieldValues extends FieldValues> = React.PropsWithChildren<UseFormReturn<TFieldValues>>;

const Form = <TFieldValues extends FieldValues>(props: FormProps<TFieldValues>): React.ReactElement => {
    return <FormProvider {...props}>{props.children}</FormProvider>;
};


export type FormComponentType<TFieldValues extends FieldValues> = typeof Form & {
    DatePickerField: typeof FormDatePicker<TFieldValues>;
    SelectField: typeof FormSelectField<TFieldValues>;
    SaveButton: typeof FormSaveButton;
};

const FormComponent = Form as FormComponentType<FieldValues>
FormComponent.DatePickerField = FormDatePicker
FormComponent.SelectField = FormSelectField
FormComponent.SaveButton = FormSaveButton

export default FormComponent