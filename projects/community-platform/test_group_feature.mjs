import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGroupFeatures() {
  console.log('Testing Group Features...');

  try {
    // 1. Fetch two existing test users from Profile
    const { data: profiles, error: profileError } = await supabase
      .from('Profile')
      .select('id, username')
      .limit(2);

    if (profileError) throw profileError;
    if (profiles.length < 2) throw new Error('Not enough profiles for testing. Please ensure at least 2 users exist.');

    const user1 = profiles[0];
    const user2 = profiles[1];

    console.log(`Using test users: ${user1.username} and ${user2.username}`);

    // 2. Create a generic public group (simulating User 1 creating it)
    console.log(`\n--- ${user1.username} creating a new public group ---`);
    const { data: newGroup, error: groupError } = await supabase
      .from('Group')
      .insert({
        name: `Test Group ${Date.now()}`,
        description: 'A test group created via node script',
        isPrivate: false,
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (groupError) throw groupError;
    console.log('Group created:', newGroup.name, `(${newGroup.id})`);

    // 3. User 1 becomes ADMIN (simulated by script)
    console.log(`\n--- Adding ${user1.username} as ADMIN ---`);
    const { error: memberError1 } = await supabase
      .from('GroupMember')
      .insert({
        groupId: newGroup.id,
        profileId: user1.id,
        role: 'ADMIN'
      });

    if (memberError1) throw memberError1;
    console.log(`${user1.username} added as ADMIN to ${newGroup.name}`);

    // 4. User 2 joins the group as MEMBER
    console.log(`\n--- ${user2.username} joining the group ---`);
    const { error: memberError2 } = await supabase
      .from('GroupMember')
      .insert({
        groupId: newGroup.id,
        profileId: user2.id,
        role: 'MEMBER'
      });

    if (memberError2) throw memberError2;
    console.log(`${user2.username} joined as MEMBER to ${newGroup.name}`);

    // 5. Fetch group details with members
    console.log('\n--- Fetching group details to verify ---');
    const { data: groupDetails, error: fetchError } = await supabase
      .from('Group')
      .select(`
        *,
        members:GroupMember(id, role, profile:Profile(id, username))
      `)
      .eq('id', newGroup.id)
      .single();

    if (fetchError) throw fetchError;
    console.log('Group Details:');
    console.dir(groupDetails, { depth: null });

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testGroupFeatures();
