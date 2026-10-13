/**
 * Render `vitest bench --reporter=json --outputFile=...` results as a Markdown table.
 * Usage: node scripts/bench-summary.mjs bench-results.json >> "$GITHUB_STEP_SUMMARY"
 */
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'

const file = process.argv[2] || 'bench-results.json'
const { testResults } = JSON.parse(readFileSync(file, 'utf8'))

const fmt = (n, digits = 4) => (Number.isFinite(n) ? n.toFixed(digits) : '-')
const lines = [
  '## Benchmarks',
  '',
  '| File | Group | Benchmark | ops/sec | mean (ms) | p99 (ms) | ±rme | samples |',
  '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
]

for (const f of testResults) {
  const path = relative(process.cwd(), f.name).replaceAll('\\', '/')
  for (const test of f.assertionResults) {
    const groupName = test.ancestorTitles.join(' > ')
    for (const group of test.benchmarks ?? []) {
      for (const b of group.tasks) {
        const { latency, throughput } = b
        lines.push(
          `| \`${path}\` | ${groupName} | ${b.name} | ${Math.round(throughput.mean).toLocaleString('en-GB')} | ${fmt(latency.mean)} | ${fmt(latency.p99)} | ${fmt(latency.rme, 2)}% | ${latency.samplesCount} |`,
        )
      }
    }
  }
}

console.log(lines.join('\n'))
