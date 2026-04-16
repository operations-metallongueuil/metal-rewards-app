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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Import from Greenspark</h1>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        {/* Instructions */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">How to export from Greenspark</h2>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Open Greenspark and navigate to your transactions list</li>
            <li>Filter by date range (e.g., today, or since your last import)</li>
            <li>Export as CSV or Excel (.xlsx)</li>
            <li>Upload the file below and click Import</li>
          </ol>
          <p className="text-xs text-gray-400 mt-3 bg-gray-50 rounded p-2">
            Only <strong>PAID FERROUS</strong> transactions are imported. Rows already in the
            system are automatically skipped — it&apos;s safe to import overlapping date ranges.
          </p>
        </div>

        {/* File drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            file ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setResult(null)
              setError('')
            }}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            {file ? (
              <div>
                <p className="font-medium text-emerald-700">{file.name}</p>
                <p className="text-sm text-emerald-600 mt-1">
                  {(file.size / 1024).toFixed(1)} KB &mdash; click to change
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 font-medium">Click to select a file</p>
                <p className="text-xs text-gray-400 mt-1">CSV, XLSX, or XLS</p>
              </div>
            )}
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="mt-4 bg-emerald-50 rounded-lg px-4 py-4 border border-emerald-200">
            <p className="font-semibold text-emerald-800 mb-2">Import complete</p>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>
                {result.imported} transaction{result.imported !== 1 ? 's' : ''} imported
              </li>
              <li>
                {result.skipped} row{result.skipped !== 1 ? 's' : ''} skipped (duplicates or
                non-ferrous)
              </li>
              {result.newRewards > 0 && (
                <li className="font-bold text-emerald-900">
                  {result.newRewards} new reward{result.newRewards !== 1 ? 's' : ''} earned — check
                  the Rewards page!
                </li>
              )}
            </ul>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="mt-5 w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors font-medium"
        >
          {loading ? 'Importing...' : 'Import File'}
        </button>
      </div>
    </div>
  )
}
