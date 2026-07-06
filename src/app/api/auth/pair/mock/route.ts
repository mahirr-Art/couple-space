import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const userId = session.user.id;

    const currentUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    if (currentUser.coupleId) {
      return NextResponse.json({
        message: "Eşleşme zaten tamamlanmış!",
        coupleId: currentUser.coupleId,
        partnerId: currentUser.partnerId,
      });
    }

    // Generate random credentials for mock partner
    const mockEmail = `mock.partner.${Math.random().toString(36).substring(2, 6)}@example.com`;
    const hashedPassword = await bcrypt.hash("password123", 10);
    const mockPairCode = `MOCK${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

    // Create Couple and mock partner in a transaction
    const couple = await db.$transaction(async (tx: any) => {
      const newCouple = await tx.couple.create({
        data: {
          anniversaryDate: new Date(),
          sharedPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGsy7275",
        },
      });

      const partner = await tx.user.create({
        data: {
          name: "Elif",
          email: mockEmail,
          password: hashedPassword,
          pairCode: mockPairCode,
          coupleId: newCouple.id,
          partnerId: currentUser.id,
        },
      });

      // Update current user
      await tx.user.update({
        where: { id: currentUser.id },
        data: {
          coupleId: newCouple.id,
          partnerId: partner.id,
        },
      });

      // Insert a welcoming message in the chat
      await tx.chatMessage.create({
        data: {
          coupleId: newCouple.id,
          senderId: partner.id,
          content: "Couple Space'e hoş geldin sevgilim! Burası ikimize özel harika bir alan olacak. ❤️",
        }
      });

      // Add a sample memory
      await tx.memory.create({
        data: {
          coupleId: newCouple.id,
          title: "İlk Buluşmamız",
          description: "Gözlerinin içine ilk baktığım o büyülü an.",
          mediaUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=600",
          mediaType: "image",
          date: new Date(),
        }
      });

      // Add a sample calendar event
      await tx.calendarEvent.create({
        data: {
          coupleId: newCouple.id,
          title: "Yıl Dönümümüz",
          description: "Birlikteliğimizin başladığı o özel gün.",
          eventDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()),
          isRecurring: true,
        }
      });

      return { newCouple, partner };
    });

    return NextResponse.json({
      message: "Sanal partner başarıyla oluşturuldu ve eşleşildi!",
      coupleId: couple.newCouple.id,
      partnerId: couple.partner.id,
    });
  } catch (error: any) {
    console.error("Mock pairing error:", error);
    return NextResponse.json({ error: "Sanal partner oluşturulurken bir hata oluştu" }, { status: 500 });
  }
}
