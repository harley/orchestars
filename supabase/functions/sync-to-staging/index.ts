import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Load environment variables
const PROD_URL = Deno.env.get('SUPABASE_URL')!
const PROD_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STAGING_URL = Deno.env.get('STAGING_SUPABASE_URL')!
const STAGING_SERVICE_ROLE_KEY = Deno.env.get('STAGING_SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase clients
const prodClient = createClient(PROD_URL, PROD_SERVICE_ROLE_KEY)
const stagingClient = createClient(STAGING_URL, STAGING_SERVICE_ROLE_KEY)

console.log('Sync function initialized.')

async function getTableNamesOrdered() {
  const { data, error } = await prodClient.rpc('get_table_names_ordered')
  if (error) throw error
  return data
}

async function syncTable(table: string, limit: number) {
  console.log(`Syncing table: ${table}`)

  const { data: prodData, error: fetchError } = await prodClient
    .from(table)
    .select('*')
    .limit(limit)

  if (fetchError) {
    console.error(`Error fetching data from ${table}:`, fetchError.message)
    return { table, success: false, error: fetchError.message }
  }

  if (!prodData || prodData.length === 0) {
    console.log(`No data found for table: ${table}`)
    return { table, success: true, message: 'No data to sync' }
  }

  const { error: insertError } = await stagingClient
    .from(table)
    .upsert(prodData, { onConflict: 'id', ignoreDuplicates: true })

  if (insertError) {
    console.error(`Error inserting into ${table}:`, insertError.message)
    return { table, success: false, error: insertError.message }
  }

  return { table, success: true, message: `Synced ${prodData.length} rows` }
}

Deno.serve(async (req) => {
  try {
    let body: { limit?: number } = {}

    if (req.body) {
      const bodyText = await req.text()
      if (bodyText.trim() !== '') {
        body = JSON.parse(bodyText)
      }
    }

    const limit = body['limit'] || 100

    // Fetch ordered tables
    const tables = await getTableNamesOrdered()
    if (!tables || tables.length === 0) {
      return new Response(JSON.stringify({ error: 'No tables found' }), { status: 400 })
    }

    // Sync tables in the correct order
    const results = []

    for (const { table_name } of tables) {
      const result = await syncTable(table_name, limit)
      results.push(result)
    }

    return new Response(JSON.stringify({ results }), { status: 200 })
  } catch (error) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
