import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Lütfen tüm alanları doldurun" }, { status: 400 });
    }

    // Check email
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanımda" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique pairing code
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

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        pairCode,
      },
    });

    return NextResponse.json({ message: "Kayıt başarılı" }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
