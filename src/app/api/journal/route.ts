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

    const entries = await db.journalEntry.findMany({
      where: { coupleId },
      orderBy: { date: "desc" },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json(entries);
  } catch (error: any) {
    console.error("Journal GET error:", error);
    return NextResponse.json({ error: "Günlük yazıları yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { title, content, date } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Başlık ve içerik gereklidir" }, { status: 400 });
    }

    const entryDate = date ? new Date(date) : new Date();

    const newEntry = await db.journalEntry.create({
      data: {
        coupleId,
        authorId: session.user.id,
        title,
        content,
        date: entryDate,
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error: any) {
    console.error("Journal POST error:", error);
    return NextResponse.json({ error: "Günlük yazısı kaydedilemedi" }, { status: 500 });
  }
}
