import { NextRequest, NextResponse } from "next/server";
import { discoverProspects } from "@/lib/engagement/prospect-finder/discover";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    brief?: string;
    region?: string;
    org_type?: string;
    industry?: string;
    count?: number;
  };

  const brief = body.brief?.trim();
  if (!brief || brief.length < 10) {
    return NextResponse.json(
      { error: "Describe the kind of prospect you want (at least 10 characters)." },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI research is not configured." }, { status: 503 });
  }

  try {
    const results = await discoverProspects({
      brief,
      region: body.region,
      orgType: body.org_type,
      industry: body.industry,
      count: body.count,
    });
    return NextResponse.json({ data: results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Prospect research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}