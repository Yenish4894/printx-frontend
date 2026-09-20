// Shared list pagination. Every admin/customer list query went unbounded, so
// page load cost grew with the business: one query returned the entire order
// history, the entire customer table, every refund ever raised.
//
// Offset paging (not cursor) on purpose: these lists are shown with page
// numbers and a total, the tables are modest, and the composite indexes added
// alongside this cover the filter+sort of each one.

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

export interface PageParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/** Clamp `?page=` / `?pageSize=` into something a query can safely take. */
export function pageParams(
  url: string | URL,
  defaultSize: number = DEFAULT_PAGE_SIZE,
): PageParams {
  const sp = (typeof url === "string" ? new URL(url) : url).searchParams;
  const rawPage = Number(sp.get("page"));
  const rawSize = Number(sp.get("pageSize"));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize = Number.isFinite(rawSize) && rawSize >= 1
    ? Math.min(MAX_PAGE_SIZE, Math.floor(rawSize))
    : defaultSize;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/** Default params for a service called without an explicit page. */
export const firstPage = (size: number = DEFAULT_PAGE_SIZE): PageParams => ({
  page: 1,
  pageSize: size,
  skip: 0,
  take: size,
});

export interface PageMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** The pagination envelope every list route spreads into its response. */
export function pageMeta(returned: number, total: number, p: PageParams): PageMeta {
  return {
    total,
    page: p.page,
    pageSize: p.pageSize,
    hasMore: p.skip + returned < total,
  };
}
