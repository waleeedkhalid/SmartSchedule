import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			brand: {
  				blue: {
  					50: 'hsl(var(--brand-blue-50))',
  					100: 'hsl(var(--brand-blue-100))',
  					200: 'hsl(var(--brand-blue-200))',
  					300: 'hsl(var(--brand-blue-300))',
  					400: 'hsl(var(--brand-blue-400))',
  					500: 'hsl(var(--brand-blue-500))',
  					600: 'hsl(var(--brand-blue-600))',
  					700: 'hsl(var(--brand-blue-700))',
  					800: 'hsl(var(--brand-blue-800))',
  					900: 'hsl(var(--brand-blue-900))',
  					DEFAULT: 'hsl(var(--brand-blue-600))'
  				}
  			},
  			slate: {
  				50: 'hsl(var(--slate-50))',
  				100: 'hsl(var(--slate-100))',
  				200: 'hsl(var(--slate-200))',
  				300: 'hsl(var(--slate-300))',
  				400: 'hsl(var(--slate-400))',
  				500: 'hsl(var(--slate-500))',
  				600: 'hsl(var(--slate-600))',
  				700: 'hsl(var(--slate-700))',
  				800: 'hsl(var(--slate-800))',
  				900: 'hsl(var(--slate-900))'
  			},
  			teal: {
  				50: 'hsl(var(--teal-50))',
  				100: 'hsl(var(--teal-100))',
  				500: 'hsl(var(--teal-500))',
  				600: 'hsl(var(--teal-600))',
  				900: 'hsl(var(--teal-900))',
  				DEFAULT: 'hsl(var(--teal-600))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				light: 'hsl(var(--success-light))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				light: 'hsl(var(--warning-light))'
  			},
  			error: {
  				DEFAULT: 'hsl(var(--error))',
  				light: 'hsl(var(--error-light))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				light: 'hsl(var(--info-light))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
