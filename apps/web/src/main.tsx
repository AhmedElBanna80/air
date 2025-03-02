import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	RouterProvider,
	createRootRoute,
	createRoute,
	createRouter
} from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import reportWebVitals from "./reportWebVitals.ts";
import "./styles.css";

import { ThemeProvider } from "./lib/theme-provider.tsx";
import { RootComponent } from "./routes/_root.tsx";
import { ChartsPage } from "./routes/charts.tsx";
import { IndexPage } from "./routes/index.tsx";
import { UploadPage } from "./routes/upload.tsx";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
	component: RootComponent,
});

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: IndexPage,
});

const uploadRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/upload",
	component: UploadPage,
});

const chartsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/charts",
	component: ChartsPage
})

// Placeholder Routes for Date Range and Settings
const dateRangeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/date-range",
	component: () => (
		<div className="p-6">
			<h1 className="text-2xl font-bold">Date Range</h1>
			<p className="mt-4">Date range filtering functionality coming soon.</p>
		</div>
	)
});

const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	component: () => (
		<div className="p-6">
			<h1 className="text-2xl font-bold">Settings</h1>
			<p className="mt-4">Settings configuration coming soon.</p>
		</div>
	)
});

const routeTree = rootRoute.addChildren([
	indexRoute, 
	uploadRoute, 
	chartsRoute,
	dateRangeRoute,
	settingsRoute
]);

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<ThemeProvider defaultTheme="dark">
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
				</QueryClientProvider>
			</ThemeProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
