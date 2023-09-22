<script setup>
import { Suspense } from 'vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<style scoped>
</style>
