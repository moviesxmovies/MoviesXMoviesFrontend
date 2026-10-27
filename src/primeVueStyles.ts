import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

/**
 * Tema PrimeVue de MoviesXMovies.
 * Los valores son los mismos que los tokens de src/style.css
 * (ver docs/guia-de-estilos.pdf). Si cambias uno, cambia el otro.
 */

// Índigo de marca
const indigo = {
  50: "#f0efff",
  100: "#e3e1ff",
  200: "#cac6ff",
  300: "#aba5ff",
  400: "#8b83ff",
  500: "#6c62f5",
  600: "#5248e6",
  700: "#3d34d6",
  800: "#3029ad",
  900: "#282487",
  950: "#18154f",
};

// Neutros fríos con un toque violeta
const ink = {
  0: "#ffffff",
  50: "#f6f6fb",
  100: "#eeeef6",
  200: "#dcdbea",
  300: "#c3c2d6",
  400: "#9896b3",
  500: "#6e6d85",
  600: "#4a4960",
  700: "#2e2c4a",
  800: "#201e36",
  900: "#17162a",
  950: "#0f0e17",
};

const MyPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: "0",
      xs: "4px",
      sm: "6px",
      md: "10px",
      lg: "14px",
      xl: "20px",
    },
  },
  semantic: {
    primary: indigo,
    focusRing: {
      width: "2px",
      style: "solid",
      color: "{primary.color}",
      offset: "2px",
    },
    formField: {
      paddingX: "0.875rem",
      paddingY: "0.625rem",
      borderRadius: "{border.radius.md}",
    },
    colorScheme: {
      light: {
        surface: ink,
        primary: {
          color: "{primary.700}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.800}",
          activeColor: "{primary.900}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.100}",
          color: "{primary.800}",
          focusColor: "{primary.900}",
        },
        formField: {
          background: "{surface.0}",
          disabledBackground: "{surface.100}",
          filledBackground: "{surface.50}",
          borderColor: "#7c7a96",
          hoverBorderColor: "{surface.600}",
          focusBorderColor: "{primary.color}",
          invalidBorderColor: "#c42020",
          color: "{surface.950}",
          disabledColor: "{surface.500}",
          placeholderColor: "#626178",
          floatLabelColor: "#626178",
          floatLabelFocusColor: "{primary.color}",
          iconColor: "#626178",
        },
        text: {
          color: "#15141f",
          hoverColor: "#15141f",
          mutedColor: "#4a4960",
          hoverMutedColor: "#15141f",
        },
        content: {
          background: "{surface.0}",
          hoverBackground: "{surface.100}",
          borderColor: "{surface.200}",
          color: "{text.color}",
          hoverColor: "{text.hover.color}",
        },
        overlay: {
          select: { background: "{surface.0}", borderColor: "{surface.200}", color: "{text.color}" },
          popover: { background: "{surface.0}", borderColor: "{surface.200}", color: "{text.color}" },
          modal: { background: "{surface.0}", borderColor: "{surface.200}", color: "{text.color}" },
        },
      },
      dark: {
        surface: ink,
        primary: {
          color: "{primary.400}",
          contrastColor: "#0f0e17",
          hoverColor: "{primary.300}",
          activeColor: "{primary.200}",
        },
        highlight: {
          background: "color-mix(in srgb, {primary.400} 18%, transparent)",
          focusBackground: "color-mix(in srgb, {primary.400} 28%, transparent)",
          color: "{primary.200}",
          focusColor: "{primary.100}",
        },
        formField: {
          background: "{surface.950}",
          disabledBackground: "{surface.800}",
          filledBackground: "{surface.800}",
          borderColor: "#6a6890",
          hoverBorderColor: "{surface.400}",
          focusBorderColor: "{primary.color}",
          invalidBorderColor: "#ff7a7a",
          color: "#ecebf5",
          disabledColor: "{surface.400}",
          placeholderColor: "#9896b3",
          floatLabelColor: "#9896b3",
          floatLabelFocusColor: "{primary.color}",
          iconColor: "#9896b3",
        },
        text: {
          color: "#ecebf5",
          hoverColor: "#ffffff",
          mutedColor: "#b4b2cc",
          hoverMutedColor: "#ecebf5",
        },
        content: {
          background: "{surface.900}",
          hoverBackground: "{surface.800}",
          borderColor: "{surface.700}",
          color: "{text.color}",
          hoverColor: "{text.hover.color}",
        },
        overlay: {
          select: { background: "{surface.900}", borderColor: "{surface.700}", color: "{text.color}" },
          popover: { background: "{surface.900}", borderColor: "{surface.700}", color: "{text.color}" },
          modal: { background: "{surface.900}", borderColor: "{surface.700}", color: "{text.color}" },
        },
      },
    },
  },
});

export default MyPreset;
