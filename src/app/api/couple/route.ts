import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { anniversaryDate, sharedPlaylistUrl } = await req.json();

    const updateData: any = {};
    if (anniversaryDate !== undefined) {
      updateData.anniversaryDate = anniversaryDate ? new Date(anniversaryDate) : null;
    }
    if (sharedPlaylistUrl !== undefined) {
      updateData.sharedPlaylistUrl = sharedPlaylistUrl || null;
    }

    const updatedCouple = await db.couple.update({
      where: { id: coupleId },
      data: updateData,
    });

    return NextResponse.json(updatedCouple);
  } catch (error: any) {
    console.error("Couple update error:", error);
    return NextResponse.json({ error: "Bilgiler güncellenemedi" }, { status: 500 });
  }
}
