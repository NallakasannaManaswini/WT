function combineLists(list1, list2) {
  const combined = [...list1, ...list2].sort((a, b) => a.positions[0] - b.positions[0]);
  const result = [];
  for (let i = 0; i < combined.length; i++) {
    const curr = combined[i];
    let merged = false;
    for (let j = 0; j < result.length; j++) {
      const prev = result[j];
      const overlap = Math.min(curr.positions[1], prev.positions[1]) - Math.max(curr.positions[0], prev.positions[0]);
      const len = curr.positions[1] - curr.positions[0];
      if (overlap > len / 2) {
        result[j].values = [...new Set([...prev.values, ...curr.values])];
        merged = true;
        break;
      }
    }
    if (!merged) result.push(curr);
  }

  return result;
}

module.exports = combineLists;