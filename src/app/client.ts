import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yoguoeexsjeriykojsek.supabase.co'

const supabaseKey = 'sb_publishable_CpY8gkuN1Ewr5hehb5Hh0Q_xzHpuj7W'

export const supabase = createClient(supabaseUrl, supabaseKey)