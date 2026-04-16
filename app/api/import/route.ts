import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncRewardsForCustomer } from '@/lib/rewards'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

function parseGreensparkDate(dateStr: unknown): Date {
  if (dateStr instanceof Date) return dateStr
  if (typeof dateStr === 'number') {
    // Excel serial date number
    return new Date(Math.round((dateStr - 25569) * 86400 * 1000))
  }
  const s = String(dateStr).trim()
  // Greenspark format: "04/16/2026 (08:11:47)"
  const match = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*\((\d{2}):(\d{2}):(\d{2})\)/)
  if (match) {
    const [, month, day, year, hours, minutes, seconds] = match
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    )
  }
  // Generic fallback
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d
  throw new Error(`Cannot parse date: ${dateStr}`)
}

function parseCost(costStr: unknown): number {
  return parseFloat(String(costStr).replace(/[$,\s]/g, ''))
}

function getField(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = record[key]
    if (val !== undefined && val !== null && val !== '') {
      return String(val).trim()
    }
  }
  return ''
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    let records: Record<string, unknown>[]

    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.csv')) {
      const text = new TextDecoder().decode(buffer)
      const parsed = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
      })
      records = parsed.data
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use .csv, .xlsx, or .xls.' },
        { status: 400 }
      )
    }

    let imported = 0
    let skipped = 0
    const affectedCustomerIds = new Set<string>()

    for (const record of records) {
      try {
        const status = getField(record, 'Status', 'status').toUpperCase()
        const commodityType = getField(
          record,
          'Commodity Type',
          'commodity_type',
          'CommodityType'
        ).toUpperCase()

        if (status !== 'PAID' || commodityType !== 'FERROUS') {
          skipped++
          continue
        }

        const customerName = getField(
          record,
          'Customer Name',
          'customer_name',
          'CustomerName'
        ).toUpperCase()

        if (!customerName) {
          skipped++
          continue
        }

        const effectiveDateStr = getField(
          record,
          'Effective Date',
          'effective_date',
          'EffectiveDate'
        )
        const costStr = getField(record, 'Cost', 'cost')

        if (!effectiveDateStr || !costStr) {
          skipped++
          continue
        }

        const effectiveDate = parseGreensparkDate(effectiveDateStr)
        const cost = parseCost(costStr)

        if (isNaN(cost) || cost <= 0) {
          skipped++
          continue
        }

        const customer = await prisma.customer.upsert({
          where: { name: customerName },
          update: {},
          create: { name: customerName },
        })

        try {
          await prisma.transaction.create({
            data: {
              customerId: customer.id,
              effectiveDate,
              commodityType,
              cost,
              status,
            },
          })
          imported++
          affectedCustomerIds.add(customer.id)
        } catch (e: unknown) {
          if (
            e &&
            typeof e === 'object' &&
            'code' in e &&
            (e as { code: string }).code === 'P2002'
          ) {
            skipped++ // Duplicate transaction — already imported
          } else {
            throw e
          }
        }
      } catch (e) {
        console.error('Error processing record:', record, e)
        skipped++
      }
    }

    let newRewards = 0
    for (const customerId of affectedCustomerIds) {
      newRewards += await syncRewardsForCustomer(customerId)
    }

    return NextResponse.json({ imported, skipped, newRewards })
  } catch (e) {
    console.error('Import error:', e)
    return NextResponse.json({ error: 'Import failed. Check the file format.' }, { status: 500 })
  }
}
