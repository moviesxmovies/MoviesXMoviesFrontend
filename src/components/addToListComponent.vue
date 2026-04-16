<script lang="ts" setup>
import { addMovieToList } from "@/repositories/listRepository";
import type { Movie, MovieList } from "@/types";
import { useToast } from "primevue";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useToast();
const userList = ref<MovieList[]>([]);
const props = defineProps<{
  movie: Movie;
}>();

const addToList = async (listSlug: string) => {
  try {
    await addMovieToList(listSlug, props.movie.slug);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message || t("components.actions.addToListError"),
      life: 3000,
    });
  }
};
</script>
