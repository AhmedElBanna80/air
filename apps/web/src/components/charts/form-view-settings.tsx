import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsFullScreen } from "@/lib/hooks/use-is-fullscreen";
import { MaximizeIcon } from "lucide-react";
import ChartFiltersForm from "./chart-filters-form";


export function FormViewSettings() {
	const { toggleFullScreen } =
		useIsFullScreen();

	return (
		<div className="mb-4 pb-4 border-b border-border">
			<div className="flex flex-wrap items-center justify-between gap-4">
				{/* Left side - Full Screen button */}
				<div className="flex-shrink-0">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={toggleFullScreen}
									className="flex bg-transparent border-none hover:bg-accent hover:text-accent-foreground"
								>
									<MaximizeIcon className="h-4 w-4" />
									<span className="sr-only">Full Screen</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Full Screen</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<ChartFiltersForm />
			</div>
		</div>
	);
}
