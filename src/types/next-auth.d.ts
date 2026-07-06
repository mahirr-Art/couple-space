import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      pairCode: string;
      coupleId: string | null;
      partnerId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    pairCode?: string;
    coupleId?: string | null;
    partnerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    pairCode?: string;
    coupleId?: string | null;
    partnerId?: string | null;
  }
}
