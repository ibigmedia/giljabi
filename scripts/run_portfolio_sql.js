const { Client } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync('prisma/add_portfolio_tables.sql', 'utf8');

const client = new Client({
  connectionString: 'postgresql://postgres:%2ARwDj0614ibig@db.jwgpjjpqnlgjgpvhhxvz.supabase.co:5432/postgres'
});

(async () => {
  await client.connect();
  console.log('Connected to Supabase');

  // Execute the entire SQL as one batch
  try {
    await client.query(sql);
    console.log('All portfolio tables created successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    // Try individual statements if batch fails
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 5 && !s.startsWith('--'));
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        console.log('OK:', stmt.substring(0, 70) + '...');
      } catch (e) {
        console.error('ERR:', e.message, '|', stmt.substring(0, 70));
      }
    }
  }

  await client.end();
  console.log('Done!');
})();
