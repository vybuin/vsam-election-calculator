<template>
  <Card class="stage-two-card">
    <template #content>
      <div class="card-header">
        <div>
          <h2 class="title">
            Stage 2:
            <span v-if="mode === 'direct'">Two Candidate System - Direct Vote Count</span>
            <span v-else-if="mode === 'ranked'">Ranked Choice (3+ Candidates)</span>
            <span v-else>Final Voting</span>
          </h2>

          <p class="subtitle" v-if="mode === 'ranked'">
            1st choice = 3 pts • 2nd choice = 2 pts • 3rd choice = 1 pt
          </p>
        </div>
      </div>

      <div v-if="qualifiedCandidates.length < 2" class="empty-state">
        At least 2 qualified candidates are needed for stage 2.
      </div>

      <div v-else-if="mode === 'direct'" class="group-sections">
        <details
          v-for="group in votingGroups"
          :key="group.key"
          class="group-card"
          :open="group.key === votingGroups[0].key"
        >
          <summary class="group-summary">
            <div class="group-header">
              <div class="group-header-main">
                <span class="group-name">{{ group.label }}</span>
                <span class="group-meta">
                  {{ directGroupTotal(group.key) }} total votes entered
                </span>
              </div>

              <div class="group-header-actions">
                <span class="group-weight">{{ formatWeight(weights[group.key]) }} weight</span>
                <span class="chevron" aria-hidden="true"></span>
              </div>
            </div>
          </summary>

          <div class="two-col-grid">
            <div
              v-for="candidate in qualifiedCandidates"
              :key="candidate.id"
              class="vote-field"
            >
              <label class="field-label">{{ candidate.name }}</label>
              <InputNumber
                v-model="directVotes[group.key][candidate.id]"
                :min="0"
                @update:modelValue="emitChange"
              />
            </div>
          </div>
        </details>
      </div>

      <div v-else class="group-sections">
        <details
          v-for="group in votingGroups"
          :key="group.key"
          class="group-card"
          :open="group.key === votingGroups[0].key"
        >
          <summary class="group-summary">
            <div class="group-header">
              <div class="group-header-main">
                <span class="group-name">{{ group.label }}</span>
                <span class="group-meta">
                  {{ rankedGroupTotalPoints(group.key) }} total points assigned
                </span>
              </div>

              <div class="group-header-actions">
                <span class="group-weight">{{ formatWeight(weights[group.key]) }} weight</span>
                <span class="chevron" aria-hidden="true"></span>
              </div>
            </div>
          </summary>

          <div
            v-for="candidate in qualifiedCandidates"
            :key="candidate.id"
            class="candidate-rank-row"
          >
            <div class="candidate-row-header">
              <span class="candidate-name">{{ candidate.name }}</span>
              <span class="candidate-points">
                {{ rankedGroupPoints(group.key, candidate.id) }} pts
              </span>
            </div>

            <div class="three-col-grid">
              <div class="vote-field">
                <label class="field-label">1st Choice (3 pts)</label>
                <InputNumber
                  v-model="rankedVotes[group.key][candidate.id].first"
                  :min="0"
                  @update:modelValue="emitChange"
                />
              </div>

              <div class="vote-field">
                <label class="field-label">2nd Choice (2 pts)</label>
                <InputNumber
                  v-model="rankedVotes[group.key][candidate.id].second"
                  :min="0"
                  @update:modelValue="emitChange"
                />
              </div>

              <div class="vote-field">
                <label class="field-label">3rd Choice (1 pt)</label>
                <InputNumber
                  v-model="rankedVotes[group.key][candidate.id].third"
                  :min="0"
                  @update:modelValue="emitChange"
                />
              </div>
            </div>
          </div>
        </details>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import {
  getDirectGroupTotal,
  getRankedGroupTotal,
  getRankedPoints,
  getStageTwoMode
} from "../utils/calculator.js";

const props = defineProps({
  candidates: {
    type: Array,
    required: true
  },
  weights: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["update:modelValue"]);

const votingGroups = [
  { key: "board", label: "Board Members" },
  { key: "alumni", label: "Alumni" },
  { key: "ga", label: "General Assembly" }
];

const qualifiedCandidates = computed(() => props.candidates || []);
const weights = computed(() => props.weights || { board: 0, alumni: 0, ga: 0 });

const mode = computed(() => {
  return getStageTwoMode(qualifiedCandidates.value);
});

const directVotes = reactive({
  board: {},
  alumni: {},
  ga: {}
});

const rankedVotes = reactive({
  board: {},
  alumni: {},
  ga: {}
});

function ensureStructure() {
  for (const group of votingGroups) {
    for (const candidate of qualifiedCandidates.value) {
      if (!directVotes[group.key][candidate.id]) {
        directVotes[group.key][candidate.id] =
          props.modelValue?.directVotes?.[group.key]?.[candidate.id] ?? 0;
      }

      if (!rankedVotes[group.key][candidate.id]) {
        const existing =
          props.modelValue?.rankedVotes?.[group.key]?.[candidate.id] || {};

        rankedVotes[group.key][candidate.id] = {
          first: existing.first ?? 0,
          second: existing.second ?? 0,
          third: existing.third ?? 0
        };
      }
    }

    const validIds = new Set(qualifiedCandidates.value.map((c) => c.id));

    for (const candidateId of Object.keys(directVotes[group.key])) {
      if (!validIds.has(candidateId)) {
        delete directVotes[group.key][candidateId];
      }
    }

    for (const candidateId of Object.keys(rankedVotes[group.key])) {
      if (!validIds.has(candidateId)) {
        delete rankedVotes[group.key][candidateId];
      }
    }
  }
}

watch(
  () => [props.candidates, props.modelValue],
  () => {
    ensureStructure();
  },
  { immediate: true, deep: true }
);

function directGroupTotal(groupKey) {
  return getDirectGroupTotal(groupKey, qualifiedCandidates.value, directVotes);
}

function rankedGroupPoints(groupKey, candidateId) {
  return getRankedPoints(groupKey, candidateId, rankedVotes);
}

function rankedGroupTotalPoints(groupKey) {
  return getRankedGroupTotal(groupKey, qualifiedCandidates.value, rankedVotes);
}

function emitChange() {
  const directPayload = {
    board: {},
    alumni: {},
    ga: {}
  };

  const rankedPayload = {
    board: {},
    alumni: {},
    ga: {}
  };

  for (const group of votingGroups) {
    for (const candidate of qualifiedCandidates.value) {
      directPayload[group.key][candidate.id] = Number(
        directVotes[group.key][candidate.id] || 0
      );

      rankedPayload[group.key][candidate.id] = {
        first: Number(rankedVotes[group.key][candidate.id].first || 0),
        second: Number(rankedVotes[group.key][candidate.id].second || 0),
        third: Number(rankedVotes[group.key][candidate.id].third || 0)
      };
    }
  }

  emit("update:modelValue", {
    mode: mode.value,
    directVotes: directPayload,
    rankedVotes: rankedPayload
  });
}

function formatWeight(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}
</script>

<style scoped>
.stage-two-card {
  width: 100%;
  margin-top: 1.5rem;
}

.card-header {
  margin-bottom: 1.5rem;
}

.title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: #6b7280;
}

.empty-state {
  padding: 1rem;
  border: 1px dashed #d1d5db;
  border-radius: 0.875rem;
  color: #6b7280;
  background: #fafafa;
}

.group-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.875rem;
  background: #fff;
  overflow: hidden;
}

.group-summary {
  list-style: none;
  cursor: pointer;
  padding: 1rem;
}

.group-summary::-webkit-details-marker {
  display: none;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.group-header-main {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.group-name {
  font-weight: 700;
  font-size: 1.05rem;
}

.group-meta {
  color: #6b7280;
  font-size: 0.92rem;
}

.group-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.group-weight {
  color: #6b7280;
}

.chevron {
  width: 0.7rem;
  height: 0.7rem;
  border-right: 2px solid #6b7280;
  border-bottom: 2px solid #6b7280;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-top: -0.2rem;
}

.group-card[open] .chevron {
  transform: rotate(225deg);
  margin-top: 0.2rem;
}

.two-col-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.three-col-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.vote-field {
  min-width: 0;
}

.field-label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.95rem;
}

.candidate-rank-row {
  border-top: 1px solid #f1f5f9;
  padding: 1rem;
  margin: 0 1rem;
}

.candidate-rank-row:first-of-type {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.candidate-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.candidate-name {
  font-weight: 600;
}

.candidate-points {
  color: #6b7280;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .two-col-grid,
  .three-col-grid {
    grid-template-columns: 1fr;
  }
}
</style>
