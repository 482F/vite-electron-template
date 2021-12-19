export default {
	input: 'src/main/background.js',
	output: {
		file: 'dist/background.js',
		format: 'cjs',
		compact: true,
		sourcemap: true,
	},
}
