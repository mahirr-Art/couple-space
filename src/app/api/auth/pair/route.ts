import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const { partnerCode } = await req.json();

    if (!partnerCode) {
      return NextResponse.json({ error: "Lütfen partnerinizin kodunu girin" }, { status: 400 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    if (currentUser.coupleId) {
      return NextResponse.json({ error: "Zaten eşleşmiş durumdasınız" }, { status: 400 });
    }

    if (currentUser.pairCode === partnerCode.toUpperCase()) {
      return NextResponse.json({ error: "Kendi kodunuzu giremezsiniz" }, { status: 400 });
    }

    const partnerUser = await db.user.findUnique({
      where: { pairCode: partnerCode.toUpperCase() },
    });

    if (!partnerUser) {
      return NextResponse.json({ error: "Bu koda sahip bir kullanıcı bulunamadı" }, { status: 404 });
    }

    if (partnerUser.coupleId) {
      return NextResponse.json({ error: "Bu kullanıcı zaten başka biriyle eşleşmiş" }, { status: 400 });
    }

    // Start a transaction to create Couple and link users
    const couple = await db.$transaction(async (tx) => {
      // Create Couple
      const newCouple = await tx.couple.create({
        data: {},
      });

      // Update current user
      await tx.user.update({
        where: { id: currentUser.id },
        data: {
          coupleId: newCouple.id,
          partnerId: partnerUser.id,
        },
      });

      // Update partner user
      await tx.user.update({
        where: { id: partnerUser.id },
        data: {
          coupleId: newCouple.id,
          partnerId: currentUser.id,
        },
      });

      return newCouple;
    });

    return NextResponse.json({
      message: "Eşleşme başarıyla tamamlandı!",
      coupleId: couple.id,
      partnerId: partnerUser.id,
    });
  } catch (error: any) {
    console.error("Pairing error:", error);
    return NextResponse.json({ error: "Eşleştirme sırasında bir hata oluştu" }, { status: 500 });
  }
}
