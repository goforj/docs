// metricValue keeps recorded HTTP throughput separate from reciprocal driver timings.
export function metricValue(row, metric) {
  if (metric === 'time') return row.value
  if (metric === 'ops') return row.throughput ?? 1e9 / row.value
  return row[metric]
}

// measurementAxis uses full decades for log scales and a zero origin for linear scales.
export function measurementAxis(values, logarithmic) {
  let ticks
  if (logarithmic) {
    const min = Math.floor(Math.log10(Math.min(...values)))
    const max = Math.max(min + 1, Math.ceil(Math.log10(Math.max(...values))))
    ticks = Array.from({ length: max - min + 1 }, (_, i) => 10 ** (min + i))
  } else {
    // Zero-allocation workloads still need a finite, visible axis.
    const maximum = Math.max(1, ...values)
    const step = 10 ** Math.floor(Math.log10(maximum)) / 2
    const bound = Math.ceil(maximum / step) * step
    ticks = Array.from({ length: 5 }, (_, i) => (bound * i) / 4)
  }
  return {
    ticks,
    position(value) {
      if (logarithmic) {
        return (
          ((Math.log10(value) - Math.log10(ticks[0])) /
            (Math.log10(ticks.at(-1)) - Math.log10(ticks[0]))) *
          100
        )
      }
      return (value / ticks.at(-1)) * 100
    },
  }
}
