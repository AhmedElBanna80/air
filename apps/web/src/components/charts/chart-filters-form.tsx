import { useTimeSeriesData } from "@/lib/queries/get-charts-data";
import { chartFiltersStore } from "@/lib/stores/chart-filters-store";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@tanstack/react-store";
import { RefreshCcwIcon, SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Form from "../form/form";

// Define the filter schema
const filterSchema = z.object({
	from: z.date(),
	to: z.date(),
	groupBy: z.string(),
});

const groupByOptions = [
	{ label: "Hour", value: "hour" },
	{ label: "Day", value: "day" },
	{ label: "Week", value: "week" },
	{ label: "Month", value: "month" },
];

export type ChartFilters = z.infer<typeof filterSchema>;

type ChartFiltersFormProps = {
	className?: string;
}

export const ChartFiltersForm: React.FC<ChartFiltersFormProps> = ({
	className,
}) => {
	const store = useStore(chartFiltersStore);
  const { refetch } = useTimeSeriesData()

	const form = useForm<ChartFilters>({
		resolver: zodResolver(filterSchema),
		defaultValues: store,
	});

	// Handle form submission
	const onSubmit = (values: ChartFilters) => {
		chartFiltersStore.setState((state) => ({ state, ...values }));
    refetch()
	};

	return (
		<div className={cn("bg-background", className)}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex items-center p-2 gap-2">
						<Form.DatePickerField
							name="from"
							labelText="From"
							layout="horizontal"
							datePickerClassName="h-8 w-[140px] rounded-md"
							dateFormat="MMM d, yyyy"
							className="mb-0"
						/>

						<Form.DatePickerField
							name="to"
							labelText="To"
							layout="horizontal"
							datePickerClassName="h-8 w-[140px] rounded-md"
							dateFormat="MMM d, yyyy"
							className="mb-0"
						/>

						<Form.SelectField
							name="groupBy"
							labelText="Group By"
							layout="horizontal"
							options={groupByOptions}
							placeholder="Select"
							className="mb-0"
						/>
						
						<Form.SaveButton
							layout="horizontal"
							size="icon"
							variant="outline"
							className="h-8 w-8 flex items-center justify-center"
							text=""
						>
							{form.formState.isDirty ? (
								<RefreshCcwIcon className="h-4 w-4" />
							) : (
								<SearchIcon className="h-4 w-4" />
							)}
						</Form.SaveButton>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default ChartFiltersForm;
