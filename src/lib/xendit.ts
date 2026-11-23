// Klien Xendit (Invoice API) + verifikasi webhook. Lihat docs/05.
// Pembayaran one-time; status PAID HANYA ditetapkan lewat webhook terverifikasi.

const XENDIT_BASE = "https://api.xendit.co";

type CreateInvoiceParams = {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
};

type XenditInvoice = {
  id: string;
  invoice_url: string;
  status: string;
};

function authHeader(): string {
  const key = process.env.XENDIT_SECRET_KEY ?? "";
  // Basic auth: secret key sebagai username, password kosong.
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

export async function createInvoice(
  params: CreateInvoiceParams,
): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE}/v2/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      currency: "IDR",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Xendit createInvoice gagal (${res.status}): ${text}`);
  }
  return (await res.json()) as XenditInvoice;
}

/** Verifikasi header callback token webhook. Lihat docs/05 §5. */
export function verifyCallbackToken(req: Request): boolean {
  const token = req.headers.get("x-callback-token");
  const expected = process.env.XENDIT_CALLBACK_TOKEN;
  return Boolean(expected) && token === expected;
}

/** Petakan status invoice Xendit → PaymentStatus internal. */
export function mapInvoiceStatus(
  status: string,
): "PAID" | "EXPIRED" | "FAILED" | "PENDING" {
  switch (status.toUpperCase()) {
    case "PAID":
    case "SETTLED":
      return "PAID";
    case "EXPIRED":
      return "EXPIRED";
    case "PENDING":
      return "PENDING";
    default:
      return "FAILED";
  }
}
