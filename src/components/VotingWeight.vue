<template>
  <Card class="w-full">
    <template #content>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold m-0">Voting Weights</h2>
          <p class="mt-2 mb-0 text-surface-600">
            Configure the weight percentage for each voting group. The total must equal 100%.
          </p>
        </div>

        <Tag
          :value="`Total: ${total.toFixed(1)}%`"
          :severity="isValid ? 'success' : 'danger'"
          class="text-base px-4 py-2"
          rounded
        />
      </div>

      <div class="mt-8 grid gap-6 md:grid-cols-3">
        <div>
          <label class="block font-semibold mb-2">Board Members %</label>
            <InputGroup>
                <InputGroupAddon>
                    <i class="pi pi-percentage"></i>
                </InputGroupAddon>

                <InputNumber
                    v-model="local.board"
                    :min="0"
                    :max="100"
                    :minFractionDigits="1"
                    :maxFractionDigits="1"
                    placeholder="Percentage"
                    class="w-full"
                />
            </InputGroup>
        </div>

        <div>
          <label class="block font-semibold mb-2">Alumni %</label>
            <InputGroup>
                <InputGroupAddon>
                    <i class="pi pi-percentage"></i>
                </InputGroupAddon>

                <InputNumber
                    v-model="local.alumni"
                    :min="0"
                    :max="100"
                    :minFractionDigits="1"
                    :maxFractionDigits="1"
                    placeholder="Percentage"
                    class="w-full"
                />
            </InputGroup>
        </div>

        <div>
          <label class="block font-semibold mb-2">General Assembly %</label>
            <InputGroup>
                <InputGroupAddon>
                    <i class="pi pi-percentage"></i>
                </InputGroupAddon>

                <InputNumber
                    v-model="local.ga"
                    :min="0"
                    :max="100"
                    :minFractionDigits="1"
                    :maxFractionDigits="1"
                    placeholder="Percentage"
                    class="w-full"
                />
            </InputGroup>
        </div>
      </div>

      <div v-if="!isValid" class="mt-4 text-sm text-red-600">
        Total must equal 100%.
      </div>
    </template>
  </Card>
</template>

<script setup>
import { reactive, computed, watch } from "vue";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Tag from "primevue/tag";
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["update:modelValue"]);

const local = reactive({
  board: props.modelValue.board ?? 55,
  alumni: props.modelValue.alumni ?? 15,
  ga: props.modelValue.ga ?? 30
});

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return;
    local.board = val.board ?? 0;
    local.alumni = val.alumni ?? 0;
    local.ga = val.ga ?? 0;
  },
  { deep: true }
);

const total = computed(() => {
  return (local.board || 0) +
         (local.alumni || 0) +
         (local.ga || 0);
});

const isValid = computed(() => {
  return Math.abs(total.value - 100) <= 0.05; //allow small float rounding
});

function emitChange() {
  emit("update:modelValue", {
    board: Number(local.board || 0),
    alumni: Number(local.alumni || 0),
    ga: Number(local.ga || 0)
  });
}
</script>