import { FormViewSettings } from "./form-view-settings";

interface ChartControlsProps {
	containerElement: HTMLElement | null;
}

export function ChartControls({
	containerElement,
}: ChartControlsProps) {
	return (
		<FormViewSettings containerElement={containerElement} />
	);
}
