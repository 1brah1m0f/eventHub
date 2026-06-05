import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    // User's event IDs (owner + staff)
    const { rows: eventRows } = await query(
      `SELECT DISTINCT event_id FROM event_staff WHERE user_id = $1`,
      [userId]
    );
    const eventIds = eventRows.map((r: any) => r.event_id);

    if (!eventIds.length) {
      return res.json({
        overview: { total_events: 0, total_registrations: 0, growth_12m: 0 },
        monthly_registrations: [],
        event_comparison: [],
        category_breakdown: [],
        trends: { best_event: null, best_month: null, best_type: null, best_day: null },
      });
    }

    const placeholders = eventIds.map((_: any, i: number) => `$${i + 1}`).join(',');

    // Overview: total events + total registrations
    const { rows: overview } = await query(
      `SELECT
         COUNT(DISTINCT e.event_id) AS total_events,
         COUNT(r.registration_id) AS total_registrations
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.event_id
         AND (r.status IS NULL OR r.status = 'approved')
       WHERE e.event_id IN (${placeholders})`,
      eventIds
    );

    // Growth: registrations last 12 months vs previous 12 months
    const { rows: growth } = await query(
      `SELECT
         COUNT(*) FILTER (WHERE registered_at >= NOW() - INTERVAL '12 months') AS recent,
         COUNT(*) FILTER (WHERE registered_at < NOW() - INTERVAL '12 months'
                            AND registered_at >= NOW() - INTERVAL '24 months') AS previous
       FROM registrations
       WHERE event_id IN (${placeholders})
         AND (status IS NULL OR status = 'approved')`,
      eventIds
    );
    const recent = parseInt(growth[0].recent) || 0;
    const previous = parseInt(growth[0].previous) || 0;
    const growth_12m = previous === 0
      ? (recent > 0 ? 100 : 0)
      : Math.round(((recent - previous) / previous) * 100);

    // Monthly registrations (last 12 months)
    const { rows: monthly } = await query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', registered_at), 'Mon YYYY') AS month,
         DATE_TRUNC('month', registered_at) AS month_date,
         COUNT(*) AS count
       FROM registrations
       WHERE event_id IN (${placeholders})
         AND (status IS NULL OR status = 'approved')
         AND registered_at >= NOW() - INTERVAL '12 months'
       GROUP BY month_date, month
       ORDER BY month_date ASC`,
      eventIds
    );

    // Event comparison (top 10 by registrations)
    const { rows: comparison } = await query(
      `SELECT
         e.event_id,
         e.title,
         e.type,
         e.date,
         e.status,
         COUNT(r.registration_id) AS registrations
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.event_id
         AND (r.status IS NULL OR r.status = 'approved')
       WHERE e.event_id IN (${placeholders})
       GROUP BY e.event_id, e.title, e.type, e.date, e.status
       ORDER BY registrations DESC
       LIMIT 10`,
      eventIds
    );

    // Category breakdown
    const { rows: categories } = await query(
      `SELECT
         e.type,
         COUNT(DISTINCT e.event_id) AS event_count,
         COUNT(r.registration_id) AS registration_count
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.event_id
         AND (r.status IS NULL OR r.status = 'approved')
       WHERE e.event_id IN (${placeholders})
       GROUP BY e.type
       ORDER BY registration_count DESC`,
      eventIds
    );

    // Best day of week
    const { rows: dayStats } = await query(
      `SELECT
         TO_CHAR(registered_at, 'Day') AS day,
         COUNT(*) AS count
       FROM registrations
       WHERE event_id IN (${placeholders})
         AND (status IS NULL OR status = 'approved')
       GROUP BY day
       ORDER BY count DESC
       LIMIT 1`,
      eventIds
    );

    const bestEvent = comparison[0] || null;
    const bestMonth = monthly.length
      ? monthly.reduce((a: any, b: any) => parseInt(a.count) >= parseInt(b.count) ? a : b)
      : null;
    const bestType = categories[0] || null;
    const bestDay = dayStats[0] || null;

    res.json({
      overview: {
        total_events: parseInt(overview[0].total_events),
        total_registrations: parseInt(overview[0].total_registrations),
        growth_12m,
      },
      monthly_registrations: monthly.map((r: any) => ({
        month: r.month,
        count: parseInt(r.count),
      })),
      event_comparison: comparison.map((r: any) => ({
        event_id: r.event_id,
        title: r.title,
        type: r.type,
        date: r.date,
        status: r.status,
        registrations: parseInt(r.registrations),
      })),
      category_breakdown: categories.map((r: any) => ({
        type: r.type,
        event_count: parseInt(r.event_count),
        registration_count: parseInt(r.registration_count),
      })),
      trends: {
        best_event: bestEvent ? { title: bestEvent.title, registrations: parseInt(bestEvent.registrations) } : null,
        best_month: bestMonth ? { label: bestMonth.month, count: parseInt(bestMonth.count) } : null,
        best_type: bestType ? { type: bestType.type, registrations: parseInt(bestType.registration_count) } : null,
        best_day: bestDay ? bestDay.day.trim() : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
