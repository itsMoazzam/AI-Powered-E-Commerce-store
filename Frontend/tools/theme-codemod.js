#!/usr/bin/env node
// tools/theme-codemod.js
// Usage: node tools/theme-codemod.js
// This script will scan .tsx/.ts/.jsx/.html files and replace common Tailwind color
// utility classes with semantic theme-aware classes (best-effort). Review changes
// before committing.

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const ROOT = path.resolve(__dirname, '..')

// Mapping from tailwind utility -> semantic class
const MAPPING = {
  // text colors
  'text-gray-900': 'text-default',
  'text-gray-800': 'text-default',
  'text-gray-700': 'text-default',
  'text-gray-600': 'text-muted',
  'text-gray-500': 'text-muted',
  'text-indigo-600': 'text-primary',
  'text-indigo-500': 'text-primary',
  'text-indigo-700': 'text-primary',
  'text-blue-600': 'text-primary',
  'text-red-600': 'text-danger',
  'text-green-600': 'text-success',

  // backgrounds
  'bg-white': 'bg-surface',
  'bg-gray-50': 'bg-surface',
  'bg-gray-100': 'bg-surface',
  'bg-indigo-600': 'bg-primary',
  'bg-indigo-500': 'bg-primary',
  'bg-blue-600': 'bg-info',
  'bg-red-600': 'bg-danger',
  'bg-green-600': 'bg-success',

  // borders
  'border-gray-200': 'border-card',
  'border-zinc-200': 'border-card',
  'border-zinc-800': 'border-card',

  // hover prefixes (simple replacements)
  'hover:bg-gray-100': 'hover:bg-surface',
  'hover:bg-white': 'hover:bg-surface',
}

function replaceInFile(filePath) {
  let changed = false
  let content = fs.readFileSync(filePath, 'utf8')
  // naive replacement: replace class tokens in JSX strings
  Object.keys(MAPPING).forEach((k) => {
    const v = MAPPING[k]
    // replace tokens surrounded by word boundaries and optionally within className strings
    const re = new RegExp("\\b" + k + "\\b", 'g')
    if (re.test(content)) {
      content = content.replace(re, v)
      changed = true
    }
  })
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log('Patched', filePath)
  }
}

function run() {
  const patterns = ['src/**/*.tsx', 'src/**/*.ts', 'src/**/*.jsx', 'src/**/*.html']
  const files = patterns.flatMap((p) => glob.sync(path.join(ROOT, p), { nodir: true }))
  console.log('Found', files.length, 'files to scan')
  files.forEach(replaceInFile)
}

run()
