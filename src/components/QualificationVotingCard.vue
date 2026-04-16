<template>
  <Card class="qualification-card">
    <template #content>
      <div class="card-header">
        <div>
          <h2 class="title">Stage 1: Qualification Voting (2/3 to qualify)</h2>
          <p class="subtitle">
            Enter vote counts for each candidate and voting group.
          </p>
        </div>
      </div>

      <div class="totals-card">
        <h3 class="totals-title">Expected Total Votes by Group</h3>
        <div class="totals-grid">
          <div class="total-field">
            <label class="field-label">Board Members</label>
            <InputNumber v-model="localTotals.board" :min="0" inputClass="w-full" @update:modelValue="emitChange" />
          </div>
          <div class="total-field">
            <label class="field-label">Alumni</label>
            <InputNumber v-model="localTotals.alumni" :min="0" inputClass="w-full" @update:modelValue="emitChange" />
          </div>
          <div class="total-field">
            <label class="field-label">General Assembly</label>
            <InputNumber v-model="localTotals.ga" :min="0" inputClass="w-full" @update:modelValue="emitChange" />
          </div>
        </div>
      </div>

      <div class="candidate-sections">
        <details
          v-for="candidate in localCandidates"
          :key="candidate.id"
          class="candidate-card"
          :open="localCandidates.length <= 1"
        >
          <summary class="candidate-summary">
            <div class="candidate-header">
              <div class="candidate-header-main">
                <h3 class="candidate-name">{{ candidate.name }}</h3>
                <span class="candidate-meta">
                  {{ completedGroups(candidate.id) }}/{{ votingGroups.length }} groups complete
                </span>
              </div>

              <div class="candidate-header-actions">
                <Tag
                  :value="resultLabel(candidate.id)"
                  :severity="isQualified(candidate.id) ? 'success' : 'secondary'"
                  rounded
                />
                <span class="chevron" aria-hidden="true"></span>
              </div>
            </div>
          </summary>

          <div
            v-for="group in votingGroups"
            :key="group.key"
            class="group-section"
          >
            <div class="group-header">
              <span class="group-name">{{ group.label }}</span>
              <span class="group-weight">{{ formatWeight(weights[group.key]) }} weight</span>
            </div>

            <div class="vote-grid">
              <div class="vote-field">
                <label class="field-label">Yes</label>
                <InputNumber
                  v-model="votes[candidate.id][group.key].yes"
                  :min="0"
                  @update:modelValue="emitChange"
                />
              </div>

              <div class="vote-field">
                <label class="field-label">No</label>
                <InputNumber
                  v-model="votes[candidate.id][group.key].no"
                  :min="0"
                  @update:modelValue="emitChange"
                />
              </div>

              <div class="vote-field">
                <label class="field-label">Abstain</label>
                <InputNumber
                  v-model="votes[candidate.id][group.key].abstain"
                  :min="0"
                  @update:modelValue="emitChange"
                />
              </div>
            </div>

            <div class="group-footer">
              <span>
                Count entered:
                {{ enteredTotal(candidate.id, group.key) }} / {{ localTotals[group.key] || 0 }}
              </span>
              <span
                :class="[
                  'validation-text',
                  isGroupValid(candidate.id, group.key) ? 'valid' : 'invalid'
                ]"
              >
                {{ isGroupValid(candidate.id, group.key) ? 'Valid total' : 'Total mismatch' }}
              </span>
            </div>
          </div>
        </details>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { reactive, watch, computed } from "vue";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Tag from "primevue/tag";
import {
  getQualificationWeightedScore,
  isQualifiedCandidate
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
  },
  threshold: {
    type: Number,
    default: 66.67
  }
});

const emit = defineEmits(["update:modelValue"]);

const votingGroups = [
  { key: "board", label: "Board Members" },
  { key: "alumni", label: "Alumni" },
  { key: "ga", label: "General Assembly" }
];

const localCandidates = computed(() => props.candidates || []);
const weights = computed(() => props.weights || { board: 0, alumni: 0, ga: 0 });

const localTotals = reactive({
  board: props.modelValue?.totals?.board ?? 0,
  alumni: props.modelValue?.totals?.alumni ?? 0,
  ga: props.modelValue?.totals?.ga ?? 0
});

const votes = reactive({});

function ensureVoteStructure() {
  for (const candidate of localCandidates.value) {
    if (!votes[candidate.id]) {
      votes[candidate.id] = {};
    }

    for (const group of votingGroups) {
      if (!votes[candidate.id][group.key]) {
        const existing =
          props.modelValue?.byCandidate?.[candidate.id]?.[group.key] || {};

        votes[candidate.id][group.key] = {
          yes: existing.yes ?? 0,
          no: existing.no ?? 0,
          abstain: existing.abstain ?? 0
        };
      }
    }
  }

  const validIds = new Set(localCandidates.value.map((c) => c.id));
  for (const candidateId of Object.keys(votes)) {
    if (!validIds.has(candidateId)) {
      delete votes[candidateId];
    }
  }
}

watch(
  () => [props.candidates, props.modelValue],
  () => {
    localTotals.board = props.modelValue?.totals?.board ?? localTotals.board ?? 0;
    localTotals.alumni = props.modelValue?.totals?.alumni ?? localTotals.alumni ?? 0;
    localTotals.ga = props.modelValue?.totals?.ga ?? localTotals.ga ?? 0;
    ensureVoteStructure();
  },
  { immediate: true, deep: true }
);

function enteredTotal(candidateId, groupKey) {
  const row = votes[candidateId]?.[groupKey];
  if (!row) return 0;
  return Number(row.yes || 0) + Number(row.no || 0) + Number(row.abstain || 0);
}

function isGroupValid(candidateId, groupKey) {
  return enteredTotal(candidateId, groupKey) === Number(localTotals[groupKey] || 0);
}

function completedGroups(candidateId) {
  return votingGroups.filter((group) => {
    return isGroupValid(candidateId, group.key);
  }).length;
}

function weightedScore(candidateId) {
  return getQualificationWeightedScore(
    candidateId,
    weights.value,
    { byCandidate: votes },
    votingGroups.map((group) => group.key)
  );
}

function isQualified(candidateId) {
  return isQualifiedCandidate(
    candidateId,
    weights.value,
    { byCandidate: votes },
    props.threshold,
    votingGroups.map((group) => group.key)
  );
}

function resultLabel(candidateId) {
  const score = weightedScore(candidateId).toFixed(2);
  return isQualified(candidateId)
    ? `${score}% - QUALIFIED`
    : `${score}% - Not Qualified`;
}

function emitChange() {
  const byCandidate = {};

  for (const candidate of localCandidates.value) {
    byCandidate[candidate.id] = {};

    for (const group of votingGroups) {
      byCandidate[candidate.id][group.key] = {
        yes: Number(votes[candidate.id][group.key].yes || 0),
        no: Number(votes[candidate.id][group.key].no || 0),
        abstain: Number(votes[candidate.id][group.key].abstain || 0)
      };
    }
  }

  emit("update:modelValue", {
    totals: {
      board: Number(localTotals.board || 0),
      alumni: Number(localTotals.alumni || 0),
      ga: Number(localTotals.ga || 0)
    },
    byCandidate
  });
}

function formatWeight(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}
</script>

<style scoped>
.qualification-card {
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
  margin-top: 0.5rem;
  color: #6b7280;
}

.totals-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.875rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: #fff;
}

.totals-title {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.candidate-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.candidate-card {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.94);
  overflow: hidden;
}

.candidate-summary {
  list-style: none;
  cursor: pointer;
  padding: 1.25rem 1.25rem 0.9rem;
}

.candidate-summary::-webkit-details-marker {
  display: none;
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.candidate-header-main {
  min-width: 0;
}

.candidate-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.candidate-meta {
  display: inline-block;
  margin-top: 0.35rem;
  color: #64748b;
  font-size: 0.92rem;
}

.candidate-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.candidate-card[open] .chevron {
  transform: rotate(225deg);
  margin-top: 0.2rem;
}

.group-section {
  margin: 0 1.25rem 1.25rem;
  padding: 1.15rem 1.15rem 1rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0.95rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 249, 255, 0.92));
}

.group-section:first-of-type {
  margin-top: 0;
}

.group-section:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.group-name {
  font-weight: 600;
  color: #334155;
}

.group-weight {
  color: #64748b;
  font-size: 0.95rem;
}

.vote-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.vote-field,
.total-field {
  min-width: 0;
}

.field-label {
  display: block;
  margin-bottom: 0.55rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
}

.group-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.95rem;
  font-size: 0.92rem;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: #475569;
}

.validation-text.valid {
  color: #16a34a;
  font-weight: 600;
}

.validation-text.invalid {
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 768px) {
  .totals-grid,
  .vote-grid {
    grid-template-columns: 1fr;
  }
}
</style>
