import "server-only";

import { type SQL, sql } from "drizzle-orm";

/** The one session a project row shows: the earliest from `today`, else the latest (A-12, D-8). Joined as `shown`. */
export function shownSessionJoin(today: string): SQL {
  return sql`
    left join lateral (
      select * from (
        (select ps.*, 0 as bucket from project_session ps
          where ps.project_id = p.id and ps.session_date >= ${today}::date
          order by ps.session_date, ps.start_time nulls first, ps.created_at limit 1)
        union all
        (select ps.*, 1 as bucket from project_session ps
          where ps.project_id = p.id and ps.session_date < ${today}::date
          order by ps.session_date desc, ps.start_time desc nulls last, ps.created_at desc limit 1)
      ) candidates order by bucket limit 1
    ) shown on true`;
}
