"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/formatters";
import type { AppNotification } from "@/types";

export async function getNotificationsAction() {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return { success: true, notifications: [] };
      }
      userId = defaultUser.id;
    }

    const rawNotifs = await prisma.notification.findMany({
      where: { userId },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const notifications: AppNotification[] = rawNotifs.map((n: any) => {
      let actorName = "Kapwa Commuter";
      let avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

      if (n.actor) {
        actorName = n.actor.name || n.actor.username || "Kapwa Commuter";
        avatarUrl = n.actor.avatarUrl || avatarUrl;
      }

      return {
        id: n.id,
        type: (n.type as any) || "NEW_ANSWER",
        title: n.title,
        body: n.message,
        referenceId: n.link ? n.link.replace("/feed?post=", "") : "",
        isRead: n.isRead,
        createdAt: formatRelativeTime(n.createdAt),
        actor: {
          name: actorName,
          avatarUrl: avatarUrl,
        },
      };
    });

    return { success: true, notifications };
  } catch (error: any) {
    console.error("Error in getNotificationsAction:", error);
    return { success: false, error: "Failed to load notifications", notifications: [] };
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error in markNotificationReadAction:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) userId = defaultUser.id;
    }

    if (userId) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in markAllNotificationsReadAction:", error);
    return { success: false, error: "Failed to mark all as read" };
  }
}
