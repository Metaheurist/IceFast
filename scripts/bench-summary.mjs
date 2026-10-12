/**
 * Render `vitest bench --outputJson` results as a Markdown table.
 * Usage: node scripts/bench-summary.mjs bench-results.json >> "$GITHUB_STEP_SUMMARY"
 */
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'

const file = process.argv[2] || 'bench-results.json'
const { files } = JSON.parse(readFileSync(file, 'utf8'))

const fmt = (n, digits = 4) => (Number.isFinite(n) ? n.toFixed(digits) : '-')
const lines = [
  '## Benchmarks',
  '',
  '| File | Group | Benchmark | ops/sec | mean (ms) | p99 (ms) | ±rme | samples |',
  '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
]

for (const f of files) {
  const path = relative(process.cwd(), f.filepath).replaceAll('\\', '/')
  for (const group of f.groups) {
    const groupName = group.fullName.split(' > ').slice(1).join(' > ')
    for (const b of group.benchmarks) {
      lines.push(
        `| \`${path}\` | ${groupName} | ${b.name} | ${Math.round(b.hz).toLocaleString('en-GB')} | ${fmt(b.mean)} | ${fmt(b.p99)} | ${fmt(b.rme, 2)}% | ${b.sampleCount} |`,
      )
    }
  }
}

console.log(lines.join('\n'))
