'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ImportResult {
  imported: number
  skipped: number
  newRewards: number
}

export default function ImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Import failed')
        return
      }
      setResult(data as ImportResult)
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Import from Greenspark</h1>
        <p className="text-gray-500 text-sm mt-1">Upload your daily CSV or Excel export</p>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-[20px] p-6">
        {/* Instructions */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How to export from Greenspark</h2>
          <ol className="text-sm text-gray-400 space-y-2">
            {[
              'Open Greenspark and navigate to your transactions list',
              'Filter by date range (e.g. today, or since your last import)',
              'Export as CSV or Excel (.xlsx)',
              'Upload the file below and click Import',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-orange-500 font-bold shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-gray-500">
            Only <span className="text-orange-500 font-semibold">PAID FERROUS</span> rows are imported.
            Duplicate rows are automatically skipped — safe to upload overlapping date ranges.
          </div>
        </div>

        {/* Drop zone */}
        <label
          htmlFor="file-input"
          className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            file
              ? 'border-orange-500/50 bg-orange-500/5'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setResult(null)
              setError('')
            }}
          />
          {file ? (
            <div>
              <p className="font-semibold text-orange-500">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB &mdash; click to change</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 font-medium">Click to select a file</p>
              <p className="text-xs text-gray-600 mt-1">CSV, XLSX, or XLS</p>
            </div>
          )}
        </label>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl px-5 py-4">
            <p className="font-bold text-orange-500 text-sm mb-2 uppercase tracking-wide">Import Complete</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>{result.imported} transaction{result.imported !== 1 ? 's' : ''} imported</li>
              <li className="text-gray-500">{result.skipped} row{result.skipped !== 1 ? 's' : ''} skipped (duplicates or non-ferrous)</li>
              {result.newRewards > 0 && (
                <li className="font-bold text-orange-500 mt-1">
                  {result.newRewards} new reward{result.newRewards !== 1 ? 's' : ''} earned — check the Rewards page!
                </li>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="mt-5 w-full py-3 px-6 rounded-full border-2 border-orange-500 bg-black text-white font-bold text-sm uppercase tracking-widest hover:bg-orange-500 disabled:opacity-30 transition-all duration-200"
        >
          {loading ? 'Importing...' : 'Import File'}
        </button>
      </div>
    </div>
  )
}
