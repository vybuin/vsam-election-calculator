<script setup>
import { computed, reactive, toRefs } from "vue"
import VotingWeights from "./components/VotingWeight.vue"
import Candidates from "./components/Candidates.vue"
import QualificationVotingCard from "./components/QualificationVotingCard.vue"
import StageTwoVotingCard from "./components/StageTwoVotingCard.vue"
import FinalResultCard from "./components/FinalResultCard.vue"
import {
  DEFAULT_GROUP_KEYS,
  getFinalWinner,
  getQualifiedCandidates,
  getQualifiedCount,
  getStageTwoResults
} from "./utils/calculator.js"

const electionConfig = reactive({
  weights: {
    board: 55,
    alumni: 15,
    ga: 30
  },
  candidates: [
    { id: crypto.randomUUID(), name: "Vy" },
    { id: crypto.randomUUID(), name: "Kim" },
    { id: crypto.randomUUID(), name: "Mike" }
  ],
  qualificationVotes: {
    totals: {
      board: 11,
      alumni: 5,
      ga: 35
    },
    byCandidate: {}
  },
  stageTwoVotes: {
    mode: "none",
    directVotes: {
      board: {},
      alumni: {},
      ga: {}
    },
    rankedVotes: {
      board: {},
      alumni: {},
      ga: {}
    }
  }
})

const { weights, candidates, qualificationVotes, stageTwoVotes } = toRefs(electionConfig)

const votingGroups = DEFAULT_GROUP_KEYS
const qualificationThreshold = 66.67

const qualifiedCount = computed(() => {
  return getQualifiedCount(
    candidates.value,
    weights.value,
    qualificationVotes.value,
    qualificationThreshold,
    votingGroups
  )
})

const qualifiedCandidates = computed(() => {
  return getQualifiedCandidates(
    candidates.value,
    weights.value,
    qualificationVotes.value,
    qualificationThreshold,
    votingGroups
  )
})

const finalResults = computed(() => {
  return getStageTwoResults(
    qualifiedCandidates.value,
    weights.value,
    stageTwoVotes.value,
    votingGroups
  )
})

const finalResultMode = computed(() => {
  if (qualifiedCandidates.value.length === 1) {
    return "qualification"
  }

  return stageTwoVotes.value.mode
})

const finalWinner = computed(() => {
  if (qualifiedCandidates.value.length === 1) {
    return qualifiedCandidates.value[0]
  }

  return getFinalWinner(finalResults.value)
})

const finalWinnerScore = computed(() => {
  if (qualifiedCandidates.value.length === 1) {
    return null
  }

  return finalWinner.value ? finalWinner.value.score : null
})
</script>

<template>
  <div class="app-shell p-6">
    <header class="page-header mb-8 text-center">
      <p class="eyebrow">Voting Dashboard</p>
      <h1 class="m-0 text-5xl font-bold">VSAM Election Results Calculator</h1>
    </header>
    <VotingWeights v-model="weights" />
    <Candidates v-model="candidates" :qualified-count="qualifiedCount" />
    <QualificationVotingCard
      :candidates="candidates"
      :weights="weights"
      :threshold="qualificationThreshold"
      v-model="qualificationVotes"
    />
    <StageTwoVotingCard
      :candidates="qualifiedCandidates"
      :weights="weights"
      v-model="stageTwoVotes"
    />
    <FinalResultCard
      :winner="finalWinner"
      :mode="finalResultMode"
      :score="finalWinnerScore"
    />
  </div>
</template>

<style scoped>
.app-shell {
  padding-top: 2.5rem;
}

.page-header {
  margin-bottom: 2rem;
  padding: 2.25rem 1.5rem 1rem;
}

.eyebrow {
  margin: 0 0 0.85rem;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5d88af;
}

.page-header h1 {
  color: #173653;
  letter-spacing: -0.04em;
}

.page-subtitle {
  max-width: 40rem;
  margin: 1rem auto 0;
  font-size: 1.05rem;
  color: #5f748a;
}
</style>
