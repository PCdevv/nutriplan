import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '[Supabase Config] SUPABASE_URL dan SUPABASE_KEY wajib diisi di file .env!\n' +
    '  SUPABASE_URL = URL project Supabase (contoh: https://xxx.supabase.co)\n' +
    '  SUPABASE_KEY = Supabase anon/publishable key',
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
