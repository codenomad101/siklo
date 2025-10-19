import 'dotenv/config';
import postgres from 'postgres';

const notesBySlug: Record<string, Record<string, string>> = {
  economy: {
    banking: 'Banking overview: RBI functions, monetary policy tools (CRR, SLR, repo), financial inclusion basics.',
    microfinance: 'Microfinance: SHGs, NBFC-MFIs, JLG model, regulatory landscape and outreach goals.',
    inflation: 'Inflation: CPI vs WPI, causes (demand/cost), control measures and recent trends.'
  },
  geography: {
    'physical-geography-of-india': 'Physiography: Himalayas, Northern Plains, Peninsular Plateau, coastal/archipelagos.',
    climatology: 'Climatology: Monsoon mechanism, jets, cyclones, Koppen classification basics.'
  },
};

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const categories = await sql/*sql*/`select category_id, slug from practice_categories`;

  for (const c of categories as any[]) {
    const catSlug = c.slug as string;
    const categoryId = c.category_id as string;
    const topicNotes = notesBySlug[catSlug];
    if (!topicNotes) continue;

    for (const [topicSlug, content] of Object.entries(topicNotes)) {
      const title = `${catSlug.toUpperCase()} • ${topicSlug.replace(/-/g, ' ')}`;
      await sql/*sql*/`
        insert into practice_study_materials (category_id, topic_slug, title, content, tags)
        values (${categoryId}, ${topicSlug}, ${title}, ${content}, ${JSON.stringify([catSlug, topicSlug])})
        on conflict do nothing
      `;
    }
  }

  await sql.end({ timeout: 1 });
  console.log('Seeded study materials (concise notes)');
}

main().catch((e) => { console.error(e); process.exit(1); });

