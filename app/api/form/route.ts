import { NextResponse } from "next/server";

type FormValue = string | string[];

function toSerializablePayload(formData: FormData): Record<string, FormValue> {
  const payload: Record<string, FormValue> = {};
  const uniqueKeys = new Set<string>();

  formData.forEach((_value, key) => {
    uniqueKeys.add(key);
  });

  for (const key of uniqueKeys) {
    const values = formData.getAll(key).map((value) => String(value));
    payload[key] = values.length === 1 ? values[0] : values;
  }

  return payload;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = toSerializablePayload(formData);

    const webhookUrl = process.env.FORM_WEBHOOK_URL;
    if (webhookUrl) {
      const webhookResponse = await fetch(webhookUrl, {
        body: JSON.stringify({
          payload,
          receivedAt: new Date().toISOString(),
          source: "okutherapy-next",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (!webhookResponse.ok) {
        return NextResponse.json(
          { message: "Form received but forwarding failed." },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(
      {
        message: "Thanks, we received your details.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        message: "Unable to process the form right now.",
      },
      { status: 500 },
    );
  }
}
