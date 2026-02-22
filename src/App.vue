<script setup>
import { ref } from "vue"
import VotingWeights from "./components/VotingWeight.vue"

const weights = ref({
  board: 55,
  alumni: 15,
  ga: 30
})
</script>

<template>
  <div class="p-6">
    <VotingWeights v-model="weights" />
  </div>
</template>
