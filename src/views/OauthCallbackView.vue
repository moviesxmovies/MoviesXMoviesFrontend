<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const code = route.query.code;
  console.log("Received code:", code);

//   if (code) {
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/oauth/google/",
//         {
//           code: code,
//         },
//       );

//       // 3. ¡Éxito! Aquí recibes el JWT (access y refresh)
//       const { access, refresh, user } = response.data;

//       localStorage.setItem("access_token", access);
//       localStorage.setItem("refresh_token", refresh);

//       console.log("Usuario identificado:", user);

//       // 4. Redirigir al home o al dashboard
//       router.push({ name: "home" });
//     } catch (error) {
//       console.error("Error en el login social:", error.response?.data || error);
//       router.push({ name: "login", query: { error: "failed_google_auth" } });
//     }
//   } else {
//     // Si no hay código, algo salió mal en Google
//     router.push({ name: "login" });
//   }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-2xl font-bold mb-4">OAuth Callback</h1>
    <p class="mb-4">Processing your authentication...</p>
  </div>
</template>
