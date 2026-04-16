export const DEFAULT_GROUP_KEYS = ["board", "alumni", "ga"];

function toNumber(value) {
  return Number(value || 0);
}

export function getApprovalRate(voteRow) {
  if (!voteRow) return 0;

  const yes = toNumber(voteRow.yes);
  const no = toNumber(voteRow.no);
  const denominator = yes + no;

  if (denominator === 0) return 0;
  return yes / denominator;
}

export function getQualificationWeightedScore(
  candidateId,
  weights,
  qualificationVotes,
  groupKeys = DEFAULT_GROUP_KEYS
) {
  const byCandidate = qualificationVotes?.byCandidate || {};

  return groupKeys.reduce((total, groupKey) => {
    const voteRow = byCandidate?.[candidateId]?.[groupKey];
    const weightPercent = toNumber(weights?.[groupKey]) / 100;
    return total + getApprovalRate(voteRow) * weightPercent;
  }, 0) * 100;
}

export function isQualifiedCandidate(
  candidateId,
  weights,
  qualificationVotes,
  threshold = 66.67,
  groupKeys = DEFAULT_GROUP_KEYS
) {
  return getQualificationWeightedScore(
    candidateId,
    weights,
    qualificationVotes,
    groupKeys
  ) >= threshold;
}

export function getQualifiedCandidates(
  candidates,
  weights,
  qualificationVotes,
  threshold = 66.67,
  groupKeys = DEFAULT_GROUP_KEYS
) {
  return (candidates || []).filter((candidate) => {
    return isQualifiedCandidate(
      candidate.id,
      weights,
      qualificationVotes,
      threshold,
      groupKeys
    );
  });
}

export function getQualifiedCount(
  candidates,
  weights,
  qualificationVotes,
  threshold = 66.67,
  groupKeys = DEFAULT_GROUP_KEYS
) {
  return getQualifiedCandidates(
    candidates,
    weights,
    qualificationVotes,
    threshold,
    groupKeys
  ).length;
}

export function getStageTwoMode(candidates) {
  const count = (candidates || []).length;
  if (count === 2) return "direct";
  if (count >= 3) return "ranked";
  return "none";
}

export function getDirectGroupTotal(groupKey, candidates, directVotes) {
  return (candidates || []).reduce((sum, candidate) => {
    return sum + toNumber(directVotes?.[groupKey]?.[candidate.id]);
  }, 0);
}

export function getRankedPoints(groupKey, candidateId, rankedVotes) {
  const row = rankedVotes?.[groupKey]?.[candidateId];
  if (!row) return 0;

  return (
    toNumber(row.first) * 3 +
    toNumber(row.second) * 2 +
    toNumber(row.third)
  );
}

export function getRankedGroupTotal(groupKey, candidates, rankedVotes) {
  return (candidates || []).reduce((sum, candidate) => {
    return sum + getRankedPoints(groupKey, candidate.id, rankedVotes);
  }, 0);
}

export function getStageTwoResults(
  candidates,
  weights,
  stageTwoVotes,
  groupKeys = DEFAULT_GROUP_KEYS
) {
  const mode = stageTwoVotes?.mode || getStageTwoMode(candidates);

  if (mode === "direct") {
    return (candidates || [])
      .map((candidate) => {
        const score = groupKeys.reduce((total, groupKey) => {
          const groupTotal = getDirectGroupTotal(
            groupKey,
            candidates,
            stageTwoVotes?.directVotes
          );

          if (groupTotal === 0) return total;

          const weightPercent = toNumber(weights?.[groupKey]) / 100;
          const share =
            toNumber(stageTwoVotes?.directVotes?.[groupKey]?.[candidate.id]) /
            groupTotal;

          return total + share * weightPercent;
        }, 0) * 100;

        return {
          id: candidate.id,
          name: candidate.name,
          score
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  if (mode === "ranked") {
    return (candidates || [])
      .map((candidate) => {
        const score = groupKeys.reduce((total, groupKey) => {
          const groupTotal = getRankedGroupTotal(
            groupKey,
            candidates,
            stageTwoVotes?.rankedVotes
          );

          if (groupTotal === 0) return total;

          const weightPercent = toNumber(weights?.[groupKey]) / 100;
          const share =
            getRankedPoints(
              groupKey,
              candidate.id,
              stageTwoVotes?.rankedVotes
            ) / groupTotal;

          return total + share * weightPercent;
        }, 0) * 100;

        return {
          id: candidate.id,
          name: candidate.name,
          score
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  return [];
}

export function getFinalWinner(stageTwoResults) {
  const winner = (stageTwoResults || []).find((candidate) => candidate.score > 0);
  return winner || null;
}