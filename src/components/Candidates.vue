<template>
  <Card class="candidates-card">
    <template #content>
      <div class="card-header">
        <div>
          <h2 class="title">Candidates</h2>
          <p class="subtitle">
            {{ localCandidates.length }} total • {{ qualifiedCount }} qualified
          </p>
        </div>
      </div>

      <div class="candidate-list">
        <div
          v-for="candidate in localCandidates"
          :key="candidate.id"
          class="candidate-row"
        >
          <div class="candidate-main">
            <div v-if="editingId === candidate.id" class="edit-row">
              <InputText
                v-model="editingName"
                class="candidate-input"
                placeholder="Candidate name"
                @keyup.enter="saveEdit(candidate.id)"
                @keyup.esc="cancelEdit"
                autofocus
              />
            </div>

            <div v-else class="candidate-name">
              {{ candidate.name }}
            </div>
          </div>

          <div class="candidate-actions">
            <Button
              v-if="editingId === candidate.id"
              icon="pi pi-check"
              severity="success"
              text
              rounded
              @click="saveEdit(candidate.id)"
            />
            <Button
              v-if="editingId === candidate.id"
              icon="pi pi-times"
              severity="secondary"
              text
              rounded
              @click="cancelEdit"
            />

            <template v-else>
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                @click="startEdit(candidate)"
              />
              <Button
                icon="pi pi-times"
                severity="danger"
                text
                rounded
                @click="removeCandidate(candidate.id)"
              />
            </template>
          </div>
        </div>
      </div>

      <div class="add-section">
        <div v-if="showAddForm" class="add-form">
          <InputText
            v-model="newCandidateName"
            class="candidate-input"
            placeholder="Enter candidate name"
            @keyup.enter="addCandidate"
            @keyup.esc="cancelAdd"
            autofocus
          />

          <div class="add-actions">
            <Button
              label="Add"
              icon="pi pi-check"
              severity="success"
              @click="addCandidate"
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="cancelAdd"
            />
          </div>
        </div>

        <Button
          v-else
          label="Add Candidate"
          icon="pi pi-plus"
          severity="secondary"
          outlined
          class="add-button"
          @click="showAddForm = true"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, watch } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  },
  qualifiedCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(["update:modelValue"]);

const localCandidates = ref([]);
const showAddForm = ref(false);
const newCandidateName = ref("");
const editingId = ref(null);
const editingName = ref("");

function normalizeCandidates(candidates) {
  return (candidates || []).map((candidate, index) => ({
    id: candidate.id ?? `candidate-${Date.now()}-${index}`,
    name: candidate.name ?? ""
  }));
}

watch(
  () => props.modelValue,
  (newValue) => {
    localCandidates.value = normalizeCandidates(newValue);
  },
  { immediate: true, deep: true }
);

function emitChange() {
  emit(
    "update:modelValue",
    localCandidates.value.map((candidate) => ({
      ...candidate
    }))
  );
}

function addCandidate() {
  const trimmedName = newCandidateName.value.trim();

  if (!trimmedName) return;

  localCandidates.value.push({
    id: crypto.randomUUID(),
    name: trimmedName
  });

  newCandidateName.value = "";
  showAddForm.value = false;
  emitChange();
}

function removeCandidate(candidateId) {
  localCandidates.value = localCandidates.value.filter(
    (candidate) => candidate.id !== candidateId
  );

  if (editingId.value === candidateId) {
    cancelEdit();
  }

  emitChange();
}

function startEdit(candidate) {
  editingId.value = candidate.id;
  editingName.value = candidate.name;
}

function saveEdit(candidateId) {
  const trimmedName = editingName.value.trim();

  if (!trimmedName) return;

  const candidate = localCandidates.value.find((item) => item.id === candidateId);

  if (!candidate) return;

  candidate.name = trimmedName;
  editingId.value = null;
  editingName.value = "";
  emitChange();
}

function cancelEdit() {
  editingId.value = null;
  editingName.value = "";
}

function cancelAdd() {
  showAddForm.value = false;
  newCandidateName.value = "";
}
</script>

<style scoped>
.candidates-card {
  width: 100%;
  margin-top: 1.5rem;
}

.card-header {
  margin-bottom: 1.5rem;
}

.title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 1rem;
}

.candidate-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.candidate-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.875rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 255, 0.96));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.candidate-main {
  flex: 1;
  min-width: 0;
}

.candidate-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
}

.edit-row {
  width: 100%;
}

.candidate-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.add-section {
  margin-top: 1.5rem;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-top: 0.5rem;
}

.add-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.add-button {
  width: 100%;
}

.candidate-input {
  width: 100%;
}

@media (max-width: 640px) {
  .candidate-row {
    align-items: flex-start;
  }

  .candidate-actions {
    margin-top: 0.25rem;
  }
}
</style>
