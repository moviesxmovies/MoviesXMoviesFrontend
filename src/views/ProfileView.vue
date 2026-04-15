<script lang="ts" setup>
import { getUserProfile } from "@/repositories/userRepository";
import type { Person } from "@/types";
import { useToast } from "primevue";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const user = ref<Person>({} as Person);
const loading = ref<boolean>(false);
const toast = useToast();
const { t } = useI18n();
const router = useRouter();

onMounted(async () => {
  const { slug } = route.params;
  loading.value = true;
  try {
    const profile = await getUserProfile(slug as string);
    user.value = profile;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("profile.error.fetching"),
    });
    router.push({ name: "NotFound" });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-background text-text font-sans p-4 sm:p-6 md:p-8">
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <aside class="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
        
        <div class="relative overflow-hidden bg-primary rounded-[2rem] shadow-2xl transition-all duration-300">
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl"></div>
          
          <div class="relative p-8 flex flex-col items-center">
            <div class="relative group mb-6">
              <div class="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 bg-secondary shadow-xl">
                <img :src="user.image" :alt="user.name" class="w-full h-full object-cover transform" />
              </div>
            </div>
            
            <h1 class="text-3xl font-display font-bold text-white text-center leading-tight mb-2">
              {{ user.name }}
            </h1>

            <div class="w-full space-y-3 bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-white/90">
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 font-semibold"><i class="pi pi-user text-accent"></i> Gender</span>
                <span class="font-normal">{{ user.gender === 1 ? 'Female' : 'Male' }}</span>
              </div>
              
              <div v-if="user.birthday" class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 font-semibold"><i class="pi pi-calendar text-accent"></i> Born</span>
                <span class="font-normal">{{ user.birthday }}</span>
              </div>
              
              <div v-if="user.deathday" class="flex items-center justify-between text-sm text-red-300">
                <span class="flex items-center gap-2 font-bold"><i class="pi pi-calendar-times"></i> Died</span>
                <span class="font-normal">{{ user.deathday }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden lg:flex flex-col bg-white border border-secondary/20 rounded-[2rem] p-8 shadow-sm">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-3 text-primary">
            <i class="pi pi-trophy text-accent"></i>
            Awards
          </h3>
          <div class="flex flex-col items-center justify-center py-6 text-center">
            <p class="italic text-sm">No awards listed yet.</p>
          </div>
        </div>
      </aside>

      <main class="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
        
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="h-10 w-2 bg-primary rounded-full"></div>
            <h2 class="text-2xl font-display font-bold tracking-tight">Biography</h2>
          </div>
          
          <div class="bg-white/40 rounded-[2rem] p-6 md:p-10 shadow-sm border border-secondary/20 relative">
            <p class="text-base md:text-lg leading-relaxed whitespace-pre-line">
              {{ user.biography || "No biography available for this person." }}
            </p>
          </div>
        </section>

        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="h-10 w-2 bg-accent rounded-full"></div>
            <h2 class="text-2xl font-display font-bold tracking-tight">Filmography</h2>
          </div>

          <div class="bg-secondary/20 rounded-[2rem] p-10 md:p-20 border-2 border-dashed border-secondary/40 flex flex-col items-center justify-center text-center">
            <div class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
              <i class="pi pi-video text-3xl text-secondary"></i>
            </div>
            <h3 class="text-xl font-semibold opacity-70">No movies found</h3>
            <p class="text-sm opacity-50 max-w-xs mx-auto">This profile's filmography is currently empty or pending updates.</p>
          </div>
        </section>

        <section class="lg:hidden bg-white dark:bg-secondary/10 border border-secondary/20 rounded-[2rem] p-8">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-3 text-primary">
            <i class="pi pi-trophy text-accent"></i>
            Awards
          </h3>
          <p class="text-gray italic text-sm">No awards listed yet.</p>
        </section>
      </main>

    </div>
  </div>
</template>