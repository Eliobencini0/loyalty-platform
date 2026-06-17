'use client';

import { useTranslations } from 'next-intl';
import { whatsappUrl } from '@/lib/contact';

/**
 * Floating WhatsApp button anchored to the bottom-right corner of every
 * page. Opens a chat with the brand number and a pre-filled localized
 * message in the visitor's current language.
 */
export default function FloatingWhatsApp() {
  const t = useTranslations();
  const message = t('contact.whatsappPrefilledMessage');

  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-wa"
      aria-label={t('floatingChat.ariaLabel')}
    >
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.27.594 4.4 1.638 6.25L3.2 28.8l6.71-1.625A12.748 12.748 0 0 0 16 28.8C23.07 28.8 28.8 23.07 28.8 16S23.07 3.2 16.001 3.2zm0 23.04a10.214 10.214 0 0 1-5.21-1.43l-.374-.222-3.985.964 1.064-3.886-.244-.4A10.198 10.198 0 0 1 5.76 16c0-5.65 4.59-10.24 10.241-10.24S26.24 10.35 26.24 16s-4.59 10.24-10.24 10.24zm5.713-7.66c-.314-.158-1.86-.917-2.148-1.022-.288-.106-.498-.158-.708.158-.21.314-.812 1.022-.997 1.232-.184.21-.367.236-.682.079-.314-.158-1.328-.49-2.531-1.562-.935-.834-1.566-1.864-1.751-2.179-.184-.314-.02-.484.138-.641.142-.142.314-.367.472-.55.157-.184.21-.314.314-.524.105-.21.052-.394-.026-.55-.078-.158-.708-1.71-.97-2.34-.255-.614-.515-.531-.708-.541l-.604-.011c-.21 0-.55.078-.838.394-.288.314-1.1 1.075-1.1 2.62s1.127 3.04 1.284 3.25c.158.21 2.218 3.39 5.378 4.748.751.324 1.337.518 1.794.663.753.24 1.439.206 1.981.125.604-.09 1.86-.76 2.122-1.493.262-.733.262-1.36.184-1.493-.078-.131-.288-.21-.602-.367z"/>
      </svg>
    </a>
  );
}
