import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iogwerpmqsgstbsfamoh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZ3dlcnBtcXNnc3Ric2ZhbW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjE0MTksImV4cCI6MjA5MDI5NzQxOX0.hFFoiDoCW244KyLXtIzTC2Qhkdo9ckJQuRpT-Hyd5QM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)