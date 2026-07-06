import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const devEmail = "dev@couple.space";
    const devPassword = "password123";

    let user = await db.user.findUnique({
      where: { email: devEmail },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(devPassword, 10);
      
      // Generate a pair code
      let pairCode = "";
      let codeExists = true;
      while (codeExists) {
        pairCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingCode = await db.user.findUnique({
          where: { pairCode },
        });
        if (!existingCode) {
          codeExists = false;
        }
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

    // Automatically pair the dev user if they are not paired
    if (!user.coupleId) {
      const hashedPassword = await bcrypt.hash(devPassword, 10);
      const partnerEmail = "elif.dev@couple.space";
      const partnerPairCode = "PARTNERDEV";

      await db.$transaction(async (tx: any) => {
        // Create Couple
        const newCouple = await tx.couple.create({
          data: {
            anniversaryDate: new Date(),
            sharedPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGsy7275",
          },
        });

        // Create partner
        const partner = await tx.user.create({
          data: {
            name: "Elif",
            email: partnerEmail,
            password: hashedPassword,
            pairCode: partnerPairCode,
            coupleId: newCouple.id,
            partnerId: user.id,
          },
        });

        // Update dev user
        await tx.user.update({
          where: { id: user.id },
          data: {
            coupleId: newCouple.id,
            partnerId: partner.id,
          },
        });

        // Create sample welcome messages
        await tx.chatMessage.create({
          data: {
            coupleId: newCouple.id,
            senderId: partner.id,
            content: "Couple Space'e hoş geldin Mahir! Burası bizim ortak alanımız. ❤️",
          },
        });

        // Add sample memory
        await tx.memory.create({
          data: {
            coupleId: newCouple.id,
            title: "Paris Seyahatimiz",
            description: "Eyfel Kulesi karşısında kahve içtiğimiz o güzel sabah.",
            mediaUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600",
            mediaType: "image",
            date: new Date(),
          },
        });

        // Add sample calendar event
        await tx.calendarEvent.create({
          data: {
            coupleId: newCouple.id,
            title: "Yıl Dönümümüz",
            description: "İlk buluştuğumuz gün.",
            eventDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()),
            isRecurring: true,
          },
        });
      });
    }

    return NextResponse.json({ message: "Dev user ready" });
  } catch (error: any) {
    console.error("Dev registration error:", error);
    return NextResponse.json({ error: "Geliştirici girişi hazırlanamadı" }, { status: 500 });
  }
}
