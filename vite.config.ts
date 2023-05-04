// @ts-ignore
import { defineConfig } from "vite";
// @ts-ignore
import react            from "@vitejs/plugin-react";
// @ts-ignore
import eslint           from "vite-plugin-eslint";

const reactchunk = [ "react", "react-router-dom", "react-dom" ];
const bootstrap = [ "react-bootstrap", "bootstrap" ];
const icons = [ "react-icons" ];
const addons = [ "react-markdown", "react-select", "lodash" ];
const sweetalert = [ "sweetalert2", "sweetalert2-react-content" ];

export default defineConfig( {
	server: {
		port: 3000,
		watch: {
			usePolling: true
		},
		proxy: {
			"/api": {
				target: "http://85.214.47.99:26080",
				changeOrigin: true,
				secure: false,
				ws: true
			}
		}
	},
	build: {
		outDir: "build",
		manifest: true,
		sourcemap: false,
		rollupOptions: {
			output: {
				entryFileNames: `entry/[name].[hash].js`,
				chunkFileNames: `chunk/[name].[hash].js`,
				assetFileNames: `asset/[name].[hash].[ext]`,
				manualChunks: {
					reactchunk, bootstrap, icons, addons, sweetalert
					//...renderChunks( dependencies )
				}
			}
		}
	},
	plugins: [
		react( {
			include: "{**/*,*}.{js,ts,jsx,tsx}",
			babel: {
				parserOpts: {
					plugins: [ "decorators-legacy" ]
				}
			}
		} ), eslint( {
			include: "{**/*,*}.{js,ts,jsx,tsx}"
		} )
	]
} );