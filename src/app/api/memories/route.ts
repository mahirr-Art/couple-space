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

    const memories = await db.memory.findMany({
      where: { coupleId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(memories);
  } catch (error: any) {
    console.error("Memories GET error:", error);
    return NextResponse.json({ error: "Anılar yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { title, description, mediaUrl, mediaType, date } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Anı başlığı gereklidir" }, { status: 400 });
    }

    const memoryDate = date ? new Date(date) : new Date();

    const newMemory = await db.memory.create({
      data: {
        coupleId,
        title,
        description: description || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || "image",
        date: memoryDate,
      },
    });

    return NextResponse.json(newMemory, { status: 201 });
  } catch (error: any) {
    console.error("Memories POST error:", error);
    return NextResponse.json({ error: "Anı kaydedilemedi" }, { status: 500 });
  }
}
