import prisma from "@/lib/prisma";
import { pageMeta, type PageParams } from "@/lib/pagination";

/** A user's own notifications, newest first, plus how many they haven't read. */
export async function listNotifications(userId: string, page: PageParams) {
  const [rows, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: page.skip,
      take: page.take,
      select: { id: true, type: true, title: true, body: true, link: true, isRead: true, createdAt: true },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return {
    notifications: rows.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
    unread,
    ...pageMeta(rows.length, total, page),
  };
}

/** Mark one notification read, or every unread one when no id is given. Only ever the caller's own. */
export async function markRead(userId: string, id?: string) {
  const { count } = await prisma.notification.updateMany({
    where: { userId, isRead: false, ...(id ? { id } : {}) },
    data: { isRead: true },
  });
  return { updated: count };
}
