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

    const items = await db.bucketListItem.findMany({
      where: { coupleId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Bucket list GET error:", error);
    return NextResponse.json({ error: "Bucket list yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const coupleId = (session.user as any).coupleId;
    const { title, description, category } = await req.json();

    if (!title || !category) {
      return NextResponse.json({ error: "Başlık ve kategori gereklidir" }, { status: 400 });
    }

    const newItem = await db.bucketListItem.create({
      data: {
        coupleId,
        title,
        description: description || null,
        category,
        isCompleted: false,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Bucket list POST error:", error);
    return NextResponse.json({ error: "Hedef eklenemedi" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).coupleId) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
    }

    const { id, isCompleted, rating, notes } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID gereklidir" }, { status: 400 });
    }

    const updateData: any = {};
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = isCompleted ? new Date() : null;
    }
    if (rating !== undefined) {
      updateData.rating = rating;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedItem = await db.bucketListItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("Bucket list PATCH error:", error);
    return NextResponse.json({ error: "Hedef güncellenemedi" }, { status: 500 });
  }
}
