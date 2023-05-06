/** @type {import('tailwindcss').Config} */

module.exports = {
	corePlugins: {
		preflight: true,
	},
	mode: 'jit',
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}'
	],
	theme: {
		extend: {},
	},
	important: true,
	plugins: [],
}