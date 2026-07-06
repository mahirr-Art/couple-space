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

    const events = await db.calendarEvent.findMany({
      where: { coupleId },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Calendar GET error:", error);
    return NextResponse.json({ error: "Etkinlikler yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { title, description, eventDate, isRecurring } = await req.json();

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Başlık ve tarih gereklidir" }, { status: 400 });
    }

    const newEvent = await db.calendarEvent.create({
      data: {
        coupleId,
        title,
        description: description || null,
        eventDate: new Date(eventDate),
        isRecurring: isRecurring || false,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("Calendar POST error:", error);
    return NextResponse.json({ error: "Etkinlik oluşturulamadı" }, { status: 500 });
  }
}
