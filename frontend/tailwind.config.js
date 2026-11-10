/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                ivory: "#FAF7F2",
                linen: "#F3ECE1",
                parchment: "#E9DFD0",
                ink: "#1C1613",
                umber: "#5C504A",
                sindoor: {
                    50: "#FDF3F4",
                    100: "#F9E2E4",
                    200: "#F0BFC4",
                    500: "#8F222D",
                    600: "#7C1D26",
                    700: "#63151C",
                    800: "#4A0E14",
                },
                brass: {
                    50: "#FBF7ED",
                    100: "#F4E9CF",
                    200: "#E7D19B",
                    400: "#D0A64C",
                    500: "#B8882C",
                    600: "#9A6E1F",
                    700: "#785314",
                },
                gold: {
                    50: "#FBF7ED",
                    100: "#F4E9CF",
                    200: "#E7D19B",
                    300: "#DDBB6C",
                    400: "#D0A64C",
                    500: "#B8882C",
                    600: "#9A6E1F",
                    700: "#785314",
                    800: "#593C0D",
                    900: "#3E2908",
                },
                emerald: {
                    50: "#EEF8F3",
                    100: "#D4EDE0",
                    600: "#176B4A",
                    700: "#115339",
                },
            },
            fontFamily: {
                serif: ["'Cormorant Garamond'", "'Noto Sans Devanagari'", "Georgia", "serif"],
                sans: ["'Plus Jakarta Sans'", "'Noto Sans Devanagari'", "system-ui", "sans-serif"],
            },
            boxShadow: {
                atelier: "0 1px 2px rgba(28, 22, 19, 0.05), 0 8px 24px -12px rgba(28, 22, 19, 0.08)",
                elevated: "0 12px 32px -12px rgba(28, 22, 19, 0.14)",
            },
        },
    },
    plugins: [],
};
