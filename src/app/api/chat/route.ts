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

    const messages = await db.chatMessage.findMany({
      where: {
        sender: {
          coupleId,
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100, // Limit to recent 100 messages
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Mesajlar yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { content, mediaUrl, mediaType } = await req.json();

    if (!content && !mediaUrl) {
      return NextResponse.json({ error: "Boş mesaj gönderilemez" }, { status: 400 });
    }

    const newMessage = await db.chatMessage.create({
      data: {
        coupleId,
        senderId: session.user.id,
        content: content || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Mesaj gönderilemedi" }, { status: 500 });
  }
}
