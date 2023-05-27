/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
const colors = require( 'tailwindcss/colors' );
  

module.exports = {
	darkMode: 'class',
	important: true,
	mode: 'jit',
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}'
	],
	fontFamily: {
		sans: [ 'Graphik', 'sans-serif' ],
		serif: [ 'Merriweather', 'serif' ]
	},
	theme: {
		extend: {}
	}
};
