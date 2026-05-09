import { createApp } from "vue";
import { router } from "../src/router/index";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import "primeflex/primeflex.css";
import "primeflex/themes/primeone-light.css";
import "primeicons/primeicons.css";
import "./assets/multi-select.css";
import i18n from "./i18n";
import App from "./App.vue";
import { ConfirmationService, ToastService } from "primevue";
import MyPreset from "./primeVueStyles";
import { useLangStore } from "./stores/langStore";
import { useThemeStore } from "./stores/themeStore";

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: ".dark",
    },
  },
});
app.use(i18n);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ToastService);
app.use(ConfirmationService);

const langStore = useLangStore(pinia);
const themeStore = useThemeStore(pinia);

themeStore.loadTheme();
langStore.fetchLanguage();

app.mount("#app");
