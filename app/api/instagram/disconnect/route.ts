/**
 * DELETE /api/instagram/disconnect
 * ----------------------------------
 * Removes the stored Instagram connection for the signed-in user.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteConnection } from "@/lib/supabase-server";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteConnection(session.user.email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[IG disconnect error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to disconnect" },
      { status: 500 }
    );
  }
}
