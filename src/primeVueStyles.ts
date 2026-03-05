import { definePreset } from "@primeuix/themes";
import Material from "@primeuix/themes/material";

const MyPreset = definePreset(Material, {
  semantic: {
    primary: {
      50:  'color-mix(in srgb, #2f27ce 10%, white)',
      100: 'color-mix(in srgb, #2f27ce 20%, white)',
      200: 'color-mix(in srgb, #2f27ce 35%, white)',
      300: 'color-mix(in srgb, #2f27ce 50%, white)',
      400: 'color-mix(in srgb, #2f27ce 70%, white)',
      500: '#2f27ce',
      600: 'color-mix(in srgb, #2f27ce 85%, black)',
      700: 'color-mix(in srgb, #2f27ce 70%, black)',
      800: 'color-mix(in srgb, #2f27ce 55%, black)',
      900: 'color-mix(in srgb, #2f27ce 40%, black)',
      950: 'color-mix(in srgb, #2f27ce 25%, black)',
    },
    colorScheme: {
      light: {
        primary: {
          color:         '{primary.500}',
          contrastColor: '#f2f2f2',
          hoverColor:    '{primary.600}',
          activeColor:   '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          color:      '{primary.700}',
        },
        surface: {
          0:   '#ffffff',
          50:  'color-mix(in srgb, #bcbbdd 10%, #f2f2f2)',
          100: 'color-mix(in srgb, #bcbbdd 20%, #f2f2f2)',
          200: 'color-mix(in srgb, #bcbbdd 35%, #f2f2f2)',
          300: '#bcbbdd',
          400: 'color-mix(in srgb, #bcbbdd 80%, #1f1f1f)',
          500: 'color-mix(in srgb, #bcbbdd 60%, #1f1f1f)',
          600: 'color-mix(in srgb, #bcbbdd 45%, #1f1f1f)',
          700: 'color-mix(in srgb, #bcbbdd 30%, #1f1f1f)',
          800: 'color-mix(in srgb, #bcbbdd 20%, #1f1f1f)',
          900: 'color-mix(in srgb, #bcbbdd 10%, #1f1f1f)',
          950: '#1f1f1f',
        }
      },
      dark: {
        primary: {
          50:  'color-mix(in srgb, #3a31d8 10%, white)',
          100: 'color-mix(in srgb, #3a31d8 20%, white)',
          200: 'color-mix(in srgb, #3a31d8 35%, white)',
          300: 'color-mix(in srgb, #3a31d8 50%, white)',
          400: 'color-mix(in srgb, #3a31d8 70%, white)',
          500: '#3a31d8',
          600: 'color-mix(in srgb, #3a31d8 85%, black)',
          700: 'color-mix(in srgb, #3a31d8 70%, black)',
          800: 'color-mix(in srgb, #3a31d8 55%, black)',
          900: 'color-mix(in srgb, #3a31d8 40%, black)',
          950: 'color-mix(in srgb, #3a31d8 25%, black)',
          color:         '#3a31d8',
          contrastColor: '#e0e0e0',
          hoverColor:    'color-mix(in srgb, #3a31d8 70%, white)',
          activeColor:   'color-mix(in srgb, #3a31d8 50%, white)',
        },
        highlight: {
          background: 'color-mix(in srgb, #3a31d8 35%, white)',
          color:      'color-mix(in srgb, #3a31d8 70%, black)',
        },
        surface: {
          0:   '#0d0d0d',
          50:  'color-mix(in srgb, #232244 20%, #0d0d0d)',
          100: 'color-mix(in srgb, #232244 35%, #0d0d0d)',
          200: 'color-mix(in srgb, #232244 50%, #0d0d0d)',
          300: '#232244',
          400: 'color-mix(in srgb, #232244 80%, #e0e0e0)',
          500: 'color-mix(in srgb, #232244 60%, #e0e0e0)',
          600: 'color-mix(in srgb, #232244 45%, #e0e0e0)',
          700: 'color-mix(in srgb, #232244 30%, #e0e0e0)',
          800: 'color-mix(in srgb, #232244 20%, #e0e0e0)',
          900: 'color-mix(in srgb, #232244 10%, #e0e0e0)',
          950: '#e0e0e0',
        }
      }
    }
  }
})

export default MyPreset