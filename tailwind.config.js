/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0d0d0d',
                surface: '#1a1a1a',
                primary: '#3b82f6',
                success: '#22c55e',
                danger: '#ef4444',
                warning: '#f59e0b',
                muted: '#525252'
            }
        },
    },
    plugins: [],
}
