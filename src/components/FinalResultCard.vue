<template>
  <Card class="final-results-card">
    <template #content>
      <div v-if="winner" class="results-content">
        <h2 class="title">Final Results</h2>

        <div class="winner-box">
          <i class="pi pi-trophy winner-icon"></i>
          <div class="winner-text">
            <div class="winner-label">WINNER: {{ winner.name }}</div>

            <div v-if="showDetails" class="winner-details">
              <span v-if="systemLabel">{{ systemLabel }}</span>
              <span v-if="score !== null">• {{ score.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <h2 class="title">Final Results</h2>
        <p class="empty-text">{{ emptyMessage }}</p>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from "vue";
import Card from "primevue/card";

const props = defineProps({
  winner: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: ""
  },
  score: {
    type: Number,
    default: null
  }
});

const showDetails = computed(() => {
  return props.mode || props.score !== null;
});

const systemLabel = computed(() => {
  if (props.mode === "qualification") return "Qualified Automatically After Stage 1";
  if (props.mode === "direct") return "Two Candidate System";
  if (props.mode === "ranked") return "Ranked Choice";
  return "";
});

const emptyMessage = computed(() => {
  if (props.mode === "qualification") {
    return "No final winner yet. A single candidate must qualify in stage 1."
  }

  return "No final winner yet. Complete stage 2 voting first."
});
</script>

<style scoped>
.final-results-card {
  width: 100%;
  margin-top: 1.5rem;
}

.results-content,
.empty-state {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.winner-box {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border: 1px solid rgba(96, 165, 250, 0.24);
  background: linear-gradient(135deg, #f7fbff 0%, #ebf4ff 58%, #f8fbff 100%);
  border-radius: 0.875rem;
  padding: 1rem 1.25rem;
}

.winner-icon {
  font-size: 1.25rem;
  color: #4c8ec8;
}

.winner-text {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.winner-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e3a5f;
}

.winner-details {
  font-size: 0.95rem;
  color: #5e748b;
}

.empty-text {
  margin: 0;
  color: #64748b;
}
</style>
