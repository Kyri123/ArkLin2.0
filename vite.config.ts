// @ts-ignore
import { defineConfig } from 'vite'
// @ts-ignore
import react            from '@vitejs/plugin-react'
// @ts-ignore
import eslint           from 'vite-plugin-eslint';

export default defineConfig( {
	optimizeDeps: {
		include: [ 'esm-dep > cjs-dep' ],
	},
	server: {
		proxy: {
			"/api": {
				target: 'http://85.214.47.99:26080',
				changeOrigin: true,
				secure: false,
				ws: true
			}
		}
	},
	build: {
		outDir: "build"
	},
	plugins: [
		react( {
			include: "{**/*,*}.{js,ts,jsx,tsx}",
			babel: {
				parserOpts: {
					plugins: [ 'decorators-legacy' ],
				},
			},
		} ), eslint( {
			include: "{**/*,*}.{js,ts,jsx,tsx}"
		} )
	]
} )