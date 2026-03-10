require('dotenv').config({ path: 'apps/next/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.log('Missing env vars');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data: d1, error: e1 } = await supabase.from('Post').select('*, author:Profile(id, username), likes:PostLike(profileId), group:Group(id, name)').limit(1);
    console.log("No Quotes Error:", e1 ? e1.message : "Success");
    
    const { data: d2, error: e2 } = await supabase.from('Post').select('*, author:Profile(id, username), likes:PostLike(profileId), group:"Group"(id, name)').limit(1);
    console.log("Double Quotes Error:", e2 ? e2.message : "Success");
  } catch (err) {
    console.error(err);
  }
}
run();
