import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  const userId = data?.claims?.sub ?? null;

  return Response.json({
    success: true,
    authenticated: !!userId,
    userId,
  });
}
