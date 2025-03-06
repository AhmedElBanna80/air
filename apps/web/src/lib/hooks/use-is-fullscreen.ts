import { useStore } from "@tanstack/react-store";
import { useCallback, useEffect, useRef } from "react";
import { isFullScreenStore } from "../stores/is-fullscreen.store";

export function useIsFullScreen() {
	const isFullScreen = useStore(isFullScreenStore);
	const containerElement = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isFullScreen) {
			if (!document.fullscreenElement) {
				containerElement.current
					?.requestFullscreen()
					.catch((err: Error) => {
						console.error(
							`Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
						);
					})
					.then(() => {
						isFullScreenStore.setState(() => true);
					});
			} else if (document.exitFullscreen) {
				document.exitFullscreen().then(() => {
					isFullScreenStore.setState(() => false);
				});
			}
		}
	}, [isFullScreen]);

	const toggleFullScreen = useCallback(() => {
		if (isFullScreen) {
			isFullScreenStore.setState(() => false);
		} else {
			isFullScreenStore.setState(() => true);
		}
	}, [isFullScreen]);
	return {
		isFullScreen,
		toggleFullScreen,
		containerElement,
	};
}
