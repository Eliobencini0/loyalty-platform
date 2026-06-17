interface WalletLinkEmail {
  to: string;
  merchantName: string;
  merchantEmail: string;
  customerFirstName: string;
  loyaltyUrl: string;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// Strip CR/LF to prevent header injection in subject lines.
function safeHeader(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

export async function sendWalletLinkEmail({ to, merchantName, merchantEmail, customerFirstName, loyaltyUrl }: WalletLinkEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Loyali <noreply@loyali.online>";
  const loyaliPrivacyUrl = process.env.PUBLIC_URL
    ? `${process.env.PUBLIC_URL}/privacy`
    : "https://loyali.online/privacy";

  const subject = safeHeader(`${merchantName}: la tua tessera fedeltà`);
  const merchantNameSafe = esc(merchantName);
  const merchantEmailSafe = esc(merchantEmail);
  const firstNameSafe = esc(customerFirstName);
  const urlSafe = esc(loyaltyUrl);
  const privacyUrlSafe = esc(loyaliPrivacyUrl);

  const html = `
    <!doctype html>
    <html><body style="font-family:Inter,system-ui,sans-serif;background:#FCF8FF;padding:24px;color:#1C1B1F;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:24px;padding:32px;">
        <h1 style="font-size:24px;margin:0 0 16px;">Ciao ${firstNameSafe},</h1>
        <p style="font-size:15px;line-height:1.5;margin:0 0 24px;">${merchantNameSafe} ti ha aggiunto al programma fedeltà. Salva la tua tessera digitale per cominciare ad accumulare punti o timbri.</p>
        <a href="${urlSafe}" style="display:inline-block;background:#EFFF74;color:#0a0a0a;padding:14px 28px;border-radius:18px;text-decoration:none;font-weight:700;font-size:16px;">Apri la mia tessera</a>
        <p style="font-size:12px;color:#666;margin:24px 0 0;">Se il bottone non funziona, copia e incolla questo link: ${urlSafe}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
        <p style="font-size:11px;color:#666;line-height:1.5;margin:0 0 12px;">
          <strong>Informativa privacy (Art. 13 GDPR)</strong><br>
          Il <strong>titolare del trattamento</strong> dei tuoi dati è ${merchantNameSafe} (contatto: <a href="mailto:${merchantEmailSafe}" style="color:#4F46E5;">${merchantEmailSafe}</a>), che gestisce il programma fedeltà cui sei stato iscritto. <strong>Loyali</strong> opera come responsabile del trattamento (processor) e fornisce solo l'infrastruttura tecnica — vedi <a href="${privacyUrlSafe}" style="color:#4F46E5;">privacy policy Loyali</a>.
        </p>
        <p style="font-size:11px;color:#666;line-height:1.5;margin:0 0 12px;">
          <strong>Finalità</strong>: gestione del programma fedeltà (Art. 6.1.f GDPR — interesse legittimo del merchant a gestire i propri clienti). I tuoi dati non saranno usati per finalità di marketing senza il tuo consenso esplicito, che puoi attivare dalla tessera digitale.
        </p>
        <p style="font-size:11px;color:#666;line-height:1.5;margin:0;">
          <strong>Diritti</strong>: hai diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei tuoi dati (Art. 15-22 GDPR). Per esercitarli contatta <a href="mailto:${merchantEmailSafe}" style="color:#4F46E5;">${merchantEmailSafe}</a>. Hai inoltre il diritto di proporre reclamo all'autorità di controllo (Garante Privacy in Italia, AEPD in Spagna).
        </p>
      </div>
    </body></html>
  `;

  if (!apiKey) {
    console.log(`[mailer] RESEND_API_KEY not set, skipping email to ${to}. URL: ${loyaltyUrl}`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error(`[mailer] Resend failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mailer] send failed:", err);
    return false;
  }
}
