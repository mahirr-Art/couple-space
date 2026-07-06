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

    const places = await db.visitedPlace.findMany({
      where: { coupleId },
      orderBy: { visitDate: "desc" },
    });

    return NextResponse.json(places);
  } catch (error: any) {
    console.error("Map GET error:", error);
    return NextResponse.json({ error: "Gidilen yerler yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { name, description, latitude, longitude, visitDate } = await req.json();

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "İsim ve koordinatlar gereklidir" }, { status: 400 });
    }

    const placeDate = visitDate ? new Date(visitDate) : new Date();

    const newPlace = await db.visitedPlace.create({
      data: {
        coupleId,
        name,
        description: description || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        visitDate: placeDate,
      },
    });

    return NextResponse.json(newPlace, { status: 201 });
  } catch (error: any) {
    console.error("Map POST error:", error);
    return NextResponse.json({ error: "Yer kaydedilemedi" }, { status: 500 });
  }
}
