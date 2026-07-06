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

    const capsules = await db.timeCapsule.findMany({
      where: { coupleId },
      orderBy: { unlockDate: "asc" },
    });

    // Mask locked content
    const now = new Date();
    const processedCapsules = capsules.map((capsule: any) => {
      const isLocked = new Date(capsule.unlockDate) > now;
      return {
        id: capsule.id,
        title: capsule.title,
        unlockDate: capsule.unlockDate,
        createdAt: capsule.createdAt,
        isLocked,
        content: isLocked ? null : capsule.content,
        mediaUrl: isLocked ? null : capsule.mediaUrl,
        mediaType: isLocked ? null : capsule.mediaType,
      };
    });

    return NextResponse.json(processedCapsules);
  } catch (error: any) {
    console.error("Time capsule GET error:", error);
    return NextResponse.json({ error: "Zaman kapsülleri yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { title, content, mediaUrl, mediaType, unlockDate } = await req.json();

    if (!title || !content || !unlockDate) {
      return NextResponse.json({ error: "Lütfen tüm zorunlu alanları doldurun" }, { status: 400 });
    }

    const unlock = new Date(unlockDate);
    if (unlock <= new Date()) {
      return NextResponse.json({ error: "Kilit açılma tarihi gelecekte bir gün olmalıdır" }, { status: 400 });
    }

    const newCapsule = await db.timeCapsule.create({
      data: {
        coupleId,
        title,
        content,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        unlockDate: unlock,
      },
    });

    return NextResponse.json(newCapsule, { status: 201 });
  } catch (error: any) {
    console.error("Time capsule POST error:", error);
    return NextResponse.json({ error: "Zaman kapsülü oluşturulamadı" }, { status: 500 });
  }
}
