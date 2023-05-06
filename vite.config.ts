// @ts-ignore
import type { Alias } from "vite";
import {
	defineConfig,
	loadEnv
}                     from "vite";
// @ts-ignore
import react          from "@vitejs/plugin-react";
// @ts-ignore
import eslint         from "vite-plugin-eslint";
import fs             from "fs";
import {
	join,
	resolve
}                     from "path";

const reactchunk = [ "react", "react-router-dom", "react-dom" ];
const bootstrap = [ "react-bootstrap", "bootstrap", "icheck-bootstrap" ];
const icons = [ "react-icons", "@fortawesome/fontawesome-svg-core", "@fortawesome/react-fontawesome" ];
const addons = [ "react-markdown", "react-select", "lodash" ];
const sweetalert = [ "sweetalert2", "sweetalert2-react-content" ];
const codemirror = [ "@uiw/react-codemirror", "@uiw/codemirror-theme-gruvbox-dark", "@codemirror/lang-json" ];

export default defineConfig( ( { command, mode, ssrBuild } ) => {
	const Paths : Record<string, string[]> = JSON.parse( fs.readFileSync( resolve( __dirname, "tsconfig.json" ), "utf-8" ).toString() ).compilerOptions.paths;
	const alias = Object.entries( Paths ).map<Alias>( ( [ key, value ] ) => ( {
		find: key.replace( "/*", "" ),
		replacement: join( __dirname, value[ 0 ].replace( "/*", "" ) )
	} ) );
	console.log( "Resolve Alias:", alias );
	const env = loadEnv( mode, process.cwd(), "" );
	return {
		define: {
			__APP_ENV__: env.APP_ENV
		},
		assetsInclude: [ "**/*.md" ],
		resolve: {
			alias
		},
		server: {
			port: 3000,
			watch: {
				usePolling: false
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
						reactchunk, bootstrap, icons, addons, sweetalert, codemirror
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
	};
} );