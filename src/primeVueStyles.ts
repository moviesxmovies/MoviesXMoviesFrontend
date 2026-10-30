import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

/**
 * Tema PrimeVue de MoviesXMovies.
 * Los valores son los mismos que los tokens de src/style.css
 * (ver docs/guia-de-estilos.pdf). Si cambias uno, cambia el otro.
 */

// Ámbar de marquesina
const amber = {
  50: "#fbf3e4",
  100: "#f6e4c4",
  200: "#f5c77e",
  300: "#f0b55c",
  400: "#e8a33d",
  500: "#c9861f",
  600: "#ad6e12",
  700: "#96580a",
  800: "#7d4907",
  900: "#663b05",
  950: "#3a2103",
};

// Grafito neutro con un punto cálido
const graphite = {
  0: "#ffffff",
  50: "#f7f6f3",
  100: "#f0efeb",
  200: "#e4e2dd",
  300: "#c9c7c1",
  400: "#908e88",
  500: "#6b6963",
  600: "#55534d",
  700: "#333331",
  800: "#232321",
  900: "#1a1a19",
  950: "#121211",
};

const MyPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: "0",
      xs: "4px",
      sm: "6px",
      md: "8px",
      lg: "12px",
      xl: "16px",
    },
  },
  semantic: {
    primary: amber,
    focusRing: {
      width: "2px",
      style: "solid",
      color: "{primary.color}",
      offset: "2px",
    },
    formField: {
      paddingX: "0.75rem",
      paddingY: "0.625rem",
      borderRadius: "{border.radius.md}",
    },
    colorScheme: {
      light: {
        surface: graphite,
        primary: {
          color: "{primary.700}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.800}",
          activeColor: "{primary.900}",
        },
        highlight: {
          background: "{surface.100}",
          focusBackground: "{surface.200}",
          color: "{text.color}",
          focusColor: "{text.color}",
        },
        formField: {
          background: "{surface.0}",
          disabledBackground: "{surface.100}",
          filledBackground: "{surface.50}",
          borderColor: "#8a877f",
          hoverBorderColor: "{surface.600}",
          focusBorderColor: "{primary.color}",
          invalidBorderColor: "#c42020",
          color: "{surface.950}",
          disabledColor: "{surface.500}",
          placeholderColor: "#6b6963",
          floatLabelColor: "#6b6963",
          floatLabelFocusColor: "{primary.color}",
          iconColor: "#6b6963",
        },
        text: {
          color: "#1c1b18",
          hoverColor: "#1c1b18",
          mutedColor: "#55534d",
          hoverMutedColor: "#1c1b18",
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
        surface: graphite,
        primary: {
          color: "{primary.400}",
          contrastColor: "#1a1206",
          hoverColor: "{primary.300}",
          activeColor: "{primary.200}",
        },
        highlight: {
          background: "{surface.800}",
          focusBackground: "{surface.700}",
          color: "{text.color}",
          focusColor: "{text.color}",
        },
        formField: {
          background: "{surface.950}",
          disabledBackground: "{surface.800}",
          filledBackground: "{surface.800}",
          borderColor: "#6d6c67",
          hoverBorderColor: "{surface.400}",
          focusBorderColor: "{primary.color}",
          invalidBorderColor: "#ef7470",
          color: "#edebe6",
          disabledColor: "{surface.400}",
          placeholderColor: "#908e88",
          floatLabelColor: "#908e88",
          floatLabelFocusColor: "{primary.color}",
          iconColor: "#908e88",
        },
        text: {
          color: "#edebe6",
          hoverColor: "#edebe6",
          mutedColor: "#a9a7a1",
          hoverMutedColor: "#edebe6",
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
