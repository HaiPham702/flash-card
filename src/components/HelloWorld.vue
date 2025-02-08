<template>
  <div>
    <vueFlashcard :front="'abc'" :back="'def'" :colorFront="'red'" footerFront="" footerBack="" headerFront
      headerBack />
  </div>
</template>
<script>
import vueFlashcard from '@/components/FlashCard.vue';

export default {
  components: { vueFlashcard }
}
</script>
<style></style>