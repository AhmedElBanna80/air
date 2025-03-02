import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [viteReact(), tailwindcss()],
	test: {
		globals: true,
		environment: "jsdom",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3030',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
				secure: false,
			}
		}
	}
});
