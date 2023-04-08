/** @type {import('tailwindcss').Config} */

module.exports = {
	mode: 'jit',
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}'
	],
	darkMode: 'media',
	theme: {
		extend: {},
		screens: {
			'sm': '576px',
			'md': '768px',
			'lg': '992px',
			'xl': '1200px',
		}
	},
	variants: {
		extend: {},
	},
	plugins: [],
}