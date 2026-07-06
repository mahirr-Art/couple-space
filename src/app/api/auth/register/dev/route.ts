import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const devEmail = "dev@couple.space";
    const devPassword = "password123";
    const partnerEmail = "elif.dev@couple.space";
    const partnerPairCode = "PARTNERDEV";

    const hashedPassword = await bcrypt.hash(devPassword, 10);

    // 1. Find or create dev user
    let user = await db.user.findUnique({
      where: { email: devEmail },
    });

    if (!user) {
      let pairCode = "";
      let codeExists = true;
      while (codeExists) {
        pairCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingCode = await db.user.findUnique({ where: { pairCode } });
        if (!existingCode) codeExists = false;
      }

      user = await db.user.create({
        data: {
          name: "Mahir",
          email: devEmail,
          password: hashedPassword,
          pairCode,
        },
      });
    }

    // 2. Find or create partner
    let partner = await db.user.findUnique({
      where: { email: partnerEmail },
    });

    if (!partner) {
      partner = await db.user.create({
        data: {
          name: "Elif",
          email: partnerEmail,
          password: hashedPassword,
          pairCode: partnerPairCode,
        },
      });
    }

    // 3. Pair them if they are not paired
    if (!user.coupleId || !partner.coupleId) {
      const coupleId = user.coupleId || partner.coupleId;
      
      let finalCoupleId = coupleId;
      if (!finalCoupleId) {
        const newCouple = await db.couple.create({
          data: {
            anniversaryDate: new Date(),
            sharedPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGsy7275",
          },
        });
        finalCoupleId = newCouple.id;

        // Seed welcome chat messages
        await db.chatMessage.create({
          data: {
            coupleId: finalCoupleId,
            senderId: partner.id,
            content: "Couple Space'e hoş geldin Mahir! Burası bizim ortak alanımız. ❤️",
          },
        });

        // Add sample memory
        await db.memory.create({
          data: {
            coupleId: finalCoupleId,
            title: "Paris Seyahatimiz",
            description: "Eyfel Kulesi karşısında kahve içtiğimiz o güzel sabah.",
            mediaUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600",
            mediaType: "image",
            date: new Date(),
          },
        });

        // Add sample calendar event
        await db.calendarEvent.create({
          data: {
            coupleId: finalCoupleId,
            title: "Yıl Dönümümüz",
            description: "İlk buluştuğumuz gün.",
            eventDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()),
            isRecurring: true,
          },
        });
      }

      // Link both users to the couple
      await db.user.update({
        where: { id: user.id },
        data: {
          coupleId: finalCoupleId,
          partnerId: partner.id,
        },
      });

      await db.user.update({
        where: { id: partner.id },
        data: {
          coupleId: finalCoupleId,
          partnerId: user.id,
        },
      });
    }

    return NextResponse.json({ message: "Dev user ready" });
  } catch (error: any) {
    console.error("Dev registration error:", error);
    return NextResponse.json({ error: "Geliştirici girişi hazırlanamadı" }, { status: 500 });
  }
}
