import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/auth/users";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body || {};
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const passwordHash = await hash(password, 10);
    const id = crypto.randomUUID();
    const user = await createUser({ id, name, email, passwordHash, image: null });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


