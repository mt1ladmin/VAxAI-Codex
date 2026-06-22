import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { orgName, email, phone, website } = await req.json() as {
    orgName?: string;
    email?: string;
    phone?: string;
    website?: string;
  };

  if (!orgName && !email && !phone) {
    return NextResponse.json({ duplicates: [] });
  }

  const supabase = createServiceClient();

  // Extract domain from website for matching
  let domain: string | null = null;
  if (website) {
    try {
      const url = website.startsWith("http") ? website : `https://${website}`;
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch { /* ignore */ }
  }

  // Search existing orgs: by name similarity, email domain, website domain
  const orgsToCheck: Array<{ id: string; name: string; website?: string; known_emails?: string[] }> = [];

  if (orgName) {
    const words = orgName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const { data: nameMatches } = await supabase
      .from("engagement_organisations")
      .select("id, name, website, notes")
      .ilike("name", `%${words[0] || orgName}%`)
      .limit(10);
    if (nameMatches) orgsToCheck.push(...nameMatches);
  }

  if (domain) {
    const { data: domainMatches } = await supabase
      .from("engagement_organisations")
      .select("id, name, website, notes")
      .ilike("website", `%${domain}%`)
      .limit(5);
    if (domainMatches) {
      for (const m of domainMatches) {
        if (!orgsToCheck.find(o => o.id === m.id)) orgsToCheck.push(m);
      }
    }
  }

  // Search contacts by email or phone
  const contactsToCheck: Array<{ id: string; first_name: string; last_name?: string; professional_email?: string; phone?: string; organisation_id?: string }> = [];

  if (email) {
    const { data: emailMatches } = await supabase
      .from("engagement_contacts")
      .select("id, first_name, last_name, professional_email, phone, organisation_id")
      .ilike("professional_email", email)
      .limit(5);
    if (emailMatches) contactsToCheck.push(...emailMatches);
  }

  if (phone) {
    const clean = phone.replace(/\D/g, "").slice(-9);
    const { data: phoneMatches } = await supabase
      .from("engagement_contacts")
      .select("id, first_name, last_name, professional_email, phone, organisation_id")
      .ilike("phone", `%${clean}%`)
      .limit(5);
    if (phoneMatches) {
      for (const m of phoneMatches) {
        if (!contactsToCheck.find(c => c.id === m.id)) contactsToCheck.push(m);
      }
    }
  }

  if (orgsToCheck.length === 0 && contactsToCheck.length === 0) {
    return NextResponse.json({ duplicates: [] });
  }

  // Use Claude to score similarity
  const candidateList = [
    ...orgsToCheck.map(o => `ORG id=${o.id} name="${o.name}" website="${o.website || ""}"`),
    ...contactsToCheck.map(c => `CONTACT id=${c.id} name="${c.first_name} ${c.last_name || ""}" email="${c.professional_email || ""}" phone="${c.phone || ""}"`),
  ].join("\n");

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `You are checking whether an incoming prospect is already in a CRM database.

Incoming prospect:
- Organisation name: "${orgName || "not provided"}"
- Email: "${email || "not provided"}"
- Phone: "${phone || "not provided"}"
- Website: "${website || "not provided"}"

Existing CRM records to compare against:
${candidateList}

Score each candidate for how likely it is the same organisation or contact. Consider name similarity, email/phone/domain matches.

Return JSON: { "duplicates": [ { "id": "...", "type": "org|contact", "score": 85, "reason": "Same name and website domain", "action": "use_existing|investigate|likely_different" } ] }

Only include records with score >= 50. "action" values:
- "use_existing": almost certainly the same record (score 85+)
- "investigate": worth checking manually (score 50-84)
- "likely_different": low confidence match

Return empty array if nothing scores >= 50.`,
    }],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  try {
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}") as { duplicates?: unknown[] };
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ duplicates: [] });
  }
}
