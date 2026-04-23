<template>
  <Card class="final-results-card">
    <template #content>
      <div v-if="winner" class="results-content">
        <h2 class="text-2xl font-semibold m-0">Results</h2>

        <div class="winner-box">
          <i class="pi pi-trophy winner-icon"></i>
          <div class="winner-text">
            <div class="winner-label">Winner: {{ winner.name }}</div>

            <div v-if="showDetails" class="winner-details">
              <span v-if="systemLabel">{{ systemLabel }}</span>
            </div>
          </div>
        </div>

        <div v-if="showDistribution" class="distribution-box">
          <div class="distribution-title">Vote Distribution</div>
          <div class="distribution-list">
            <div
              v-for="candidate in results"
              :key="candidate.id"
              class="distribution-row"
            >
              <span class="distribution-name">• {{ candidate.name }}</span>
              <span class="distribution-value">
                {{ formatPercentage(candidate.score) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <h2 class="text-2xl font-semibold m-0">Results</h2>
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
  },
  results: {
    type: Array,
    default: () => []
  }
});

const showDetails = computed(() => {
  return props.mode || props.score !== null;
});

const systemLabel = computed(() => {
  if (props.mode === "qualification") return "Qualified Automatically After Individual Qualification Voting";
  if (props.mode === "direct") return "Preference Voting";
  if (props.mode === "ranked") return "Ranked Choice Voting";
  return "";
});

const showDistribution = computed(() => {
  return props.mode !== "qualification" && props.results.length > 0;
});

const emptyMessage = computed(() => {
  if (props.mode === "qualification") {
    return "No final winner yet. A single candidate must qualify in stage 1."
  }

  return "No final winner yet. Complete the required voting stages."
});

function formatPercentage(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}
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
}

.winner-box {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border: 1px solid #535353;
  background: linear-gradient(135deg, #f7fff9 0%, #ebfff8 58%, #f8fff8 100%);
  border-radius: 0.875rem;
  padding: 1rem 1.25rem;
}

.winner-icon {
  font-size: 1.25rem;
  color: #4cc892;
}

.winner-text {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.winner-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e5f38;
}

.winner-details {
  font-size: 0.95rem;
  color: #5e748b;
}

.distribution-box {
  margin-top: 1rem;
  border: 1px solid #535353;
  border-radius: 0.875rem;
  padding: 1rem 1.25rem;
  background: #ffffff;
}

.distribution-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #111827;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.distribution-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.98rem;
  color: #334155;
}

.distribution-name {
  font-weight: 600;
}

.distribution-value {
  font-variant-numeric: tabular-nums;
  color: #1e5f38;
  font-weight: 700;
}

.empty-text {
  padding: 1rem;
  border: 1px dashed #d1d5db;
  border-radius: 0.875rem;
  color: #6b7280;
  background: #fafafa;
}
</style>
