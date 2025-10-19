import { Router } from 'express';
import { db } from '../db';
import { practiceCategories, practiceTopics, practiceStudyMaterials } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// GET study materials by category (slug or id) and optional topicSlug
router.get('/materials', async (req, res) => {
  try {
    const { category, topic, page = '1', pageSize = '10' } = req.query as { category?: string; topic?: string; page?: string; pageSize?: string };
    if (!category) {
      return res.status(400).json({ success: false, message: 'category (slug or id) is required' });
    }

    // Resolve categoryId by slug if needed
    let categoryId = category;
    if (category.length !== 36) {
      const [cat] = await db.select().from(practiceCategories).where(eq(practiceCategories.slug, category));
      if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
      categoryId = cat.categoryId;
    }

    const where = topic
      ? and(eq(practiceStudyMaterials.categoryId, categoryId), eq(practiceStudyMaterials.topicSlug, topic))
      : eq(practiceStudyMaterials.categoryId, categoryId);

    const limit = Math.max(1, Math.min(50, parseInt(pageSize as string, 10) || 10));
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const offset = (pageNum - 1) * limit;

    const items = await db
      .select()
      .from(practiceStudyMaterials)
      .where(where)
      .limit(limit)
      .offset(offset);

    // Total count
    const countRows = await db.execute(`select count(*)::int as total from practice_study_materials where category_id = '${categoryId}'${topic ? ` and topic_slug = '${topic}'` : ''}`);
    const total = Array.isArray(countRows) ? (countRows[0] as any)?.total || 0 : (countRows as any).rows?.[0]?.total || 0;

    return res.json({ success: true, data: { items, total } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch study materials' });
  }
});

export default router;

