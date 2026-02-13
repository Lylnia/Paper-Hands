/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        fontFamily: {
            mono: ['"VT323"', 'monospace'],
            sans: ['"VT323"', 'monospace'],
        },
        extend: {
            colors: {
                background: '#0d0d0d',
                surface: '#151515',
                primary: '#33ff00',
                'primary-dim': '#1a8000',
                success: '#33ff00',
                danger: '#ff0033',
                warning: '#ffee00',
                muted: '#666666'
            }
        },
    },
    plugins: [],
}
