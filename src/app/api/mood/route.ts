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

    // Fetch mood logs for both users in the couple
    const logs = await db.moodLog.findMany({
      where: {
        user: {
          coupleId,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Mood GET error:", error);
    return NextResponse.json({ error: "Mood geçmişi yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const { mood, note } = await req.json();

    if (mood === undefined || mood === null) {
      return NextResponse.json({ error: "Mood değeri gereklidir" }, { status: 400 });
    }

    const moodVal = parseInt(mood);
    if (isNaN(moodVal) || moodVal < 1 || moodVal > 5) {
      return NextResponse.json({ error: "Geçersiz mood değeri" }, { status: 400 });
    }

    const newLog = await db.moodLog.create({
      data: {
        userId: session.user.id,
        mood: moodVal,
        note: note || null,
      },
    });

    return NextResponse.json(newLog);
  } catch (error: any) {
    console.error("Mood POST error:", error);
    return NextResponse.json({ error: "Mood kaydedilemedi" }, { status: 500 });
  }
}
