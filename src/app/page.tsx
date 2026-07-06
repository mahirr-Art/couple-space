import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth");
  }

  if (!(session.user as any)?.coupleId) {
    redirect("/pair");
  }

  redirect("/dashboard");
}
