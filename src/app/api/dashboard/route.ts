import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const userId = session.user.id;

    // Get couple details and users
    const couple = await db.couple.findUnique({
      where: { id: coupleId },
      include: {
        users: true,
      },
    });

    if (!couple) {
      return NextResponse.json({ error: "İlişki bulunamadı" }, { status: 404 });
    }

    const me = couple.users.find((u) => u.id === userId);
    const partner = couple.users.find((u) => u.id !== userId);

    // Fetch moods
    const myLatestMood = await db.moodLog.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const partnerLatestMood = partner
      ? await db.moodLog.findFirst({
          where: { userId: partner.id },
          orderBy: { createdAt: "desc" },
        })
      : null;

    // Fetch next calendar event
    const nextEvent = await db.calendarEvent.findFirst({
      where: {
        coupleId,
        eventDate: { gte: new Date() },
      },
      orderBy: { eventDate: "asc" },
    });

    // Fetch counts
    const totalMemories = await db.memory.count({ where: { coupleId } });
    const totalJournalEntries = await db.journalEntry.count({ where: { coupleId } });
    const totalMessages = await db.chatMessage.count({ where: { coupleId } });
    const totalBucketListItems = await db.bucketListItem.count({ where: { coupleId } });
    const completedBucketListItems = await db.bucketListItem.count({
      where: { coupleId, isCompleted: true },
    });

    return NextResponse.json({
      anniversaryDate: couple.anniversaryDate,
      sharedPlaylistUrl: couple.sharedPlaylistUrl,
      me: {
        name: me?.name,
        avatarUrl: me?.avatarUrl,
        latestMood: myLatestMood ? { mood: myLatestMood.mood, note: myLatestMood.note, createdAt: myLatestMood.createdAt } : null,
      },
      partner: partner
        ? {
            name: partner.name,
            avatarUrl: partner.avatarUrl,
            latestMood: partnerLatestMood
              ? { mood: partnerLatestMood.mood, note: partnerLatestMood.note, createdAt: partnerLatestMood.createdAt }
              : null,
          }
        : null,
      nextEvent: nextEvent ? { title: nextEvent.title, date: nextEvent.eventDate } : null,
      stats: {
        totalMemories,
        totalJournalEntries,
        totalMessages,
        bucketList: {
          total: totalBucketListItems,
          completed: completedBucketListItems,
        },
      },
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Veriler alınırken bir hata oluştu" }, { status: 500 });
  }
}
