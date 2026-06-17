import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Camera, Search, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import { getCustomerCard, listCustomers, resolveWalletScan, type CustomerCardDetail, type MerchantCustomer } from '../api';
import CustomerProfileModal from '../components/CustomerProfileModal';
import { useOnline } from '../contexts/OnlineContext';
import { addToPendingSync } from '../db/operations';

export default function ScanQRPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'redeem' ? 'redeem' : 'add';
  const { t } = useTranslation();
  const { isOnline } = useOnline();
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<null | 'denied' | 'generic'>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MerchantCustomer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerCardDetail | null>(null);
  const [error, setError] = useState('');
  const [offlineQueued, setOfflineQueued] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasStartedRef = useRef(false);

  const fetchCustomer = useCallback(async (customerId: string) => {
    try {
      setError('');
      setOfflineQueued(false);

      if (!isOnline) {
        // Queue for offline sync
        await addToPendingSync({
          type: 'scan',
          method: 'POST',
          url: `/api/customers/${customerId}/card`,
          payload: { customerId, timestamp: Date.now() }
        });
        setOfflineQueued(true);
        setError(t('scanQR.offlineQueued') || 'Scan queued for sync when online');

        // Haptic feedback if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }

        setTimeout(() => {
          setError('');
          setOfflineQueued(false);
          scannerRef.current?.resume();
        }, 2000);
        return;
      }

      const data = await getCustomerCard(customerId);
      setCustomer(data);

      // Haptic feedback on success
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    } catch {
      setError(t('scanQR.customerNotFound'));
      // Resume scanning after 2 seconds
      setTimeout(() => {
        setError('');
        scannerRef.current?.resume();
      }, 2000);
    }
  }, [t, isOnline]);

  const onScanSuccess = useCallback(async (decodedText: string) => {
    // Stop scanning temporarily
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.pause(true);
    }

    // Try to parse as wallet token (opaque token)
    // If it's not a URL, treat it as a wallet barcode token
    if (!decodedText.includes('/')) {
      try {
        setError('');
        const walletResult = await resolveWalletScan(decodedText);
        const detail = await getCustomerCard(walletResult.customerId);
        setCustomer(detail);
        return;
      } catch {
        // Fall through to try customer ID format
        console.log('Not a wallet token, trying customer ID format');
      }
    }

    // Extract customer ID from QR code
    // Expected format: {origin}/app/customer/{customerId}
    const match = decodedText.match(/\/app\/customer\/([a-f0-9-]+)/i);
    if (!match) {
      setError(t('scanQR.invalidQR'));
      // Resume scanning after 2 seconds
      setTimeout(() => {
        setError('');
        scannerRef.current?.resume();
      }, 2000);
      return;
    }

    const customerId = match[1];
    await fetchCustomer(customerId);
  }, [fetchCustomer, t]);

  const startCamera = useCallback(() => {
    const scanner = scannerRef.current ?? new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    if (scanner.isScanning) return;

    setCameraError(null);

    // Calculate QR box size responsively (80% of viewport width, max 300px)
    const qrBoxSize = Math.min(window.innerWidth * 0.8, 300);

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
        },
        onScanSuccess,
        () => {
          // Ignore scan failures, they're normal
        }
      )
      .then(() => {
        setScanning(true);
        setCameraError(null);
      })
      .catch((err) => {
        console.error('Camera start failed:', err);
        const name = err instanceof Error ? err.name : '';
        const msg = err instanceof Error ? err.message : String(err);
        const denied = name === 'NotAllowedError'
          || /permission/i.test(msg)
          || /denied/i.test(msg);
        setCameraError(denied ? 'denied' : 'generic');
        setScanning(false);
      });
  }, [onScanSuccess]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startCamera();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch((err) => console.error('Failed to stop scanner:', err));
      }
      hasStartedRef.current = false;
    };
  }, [startCamera]);

  useEffect(() => {
    if (!showManualInput) return;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const res = await listCustomers(1, 8, q);
        if (!cancelled) setSearchResults(res.data);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [searchQuery, showManualInput]);

  const handlePickResult = async (c: MerchantCustomer) => {
    setShowManualInput(false);
    setSearchQuery('');
    setSearchResults([]);
    await fetchCustomer(c.customerId);
  };

  const handleCloseModal = () => {
    setCustomer(null);
    // Resume scanning
    if (scannerRef.current && !scannerRef.current.isScanning) {
      scannerRef.current.resume();
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="scan-qr-page">
      <div className="scan-qr-shell">
        <header className="scan-qr-header">
          <div>
            <span className="app-page-kicker scan-qr-kicker">{t('scanQR.title')}</span>
            <h1>{t('scanQR.title')}</h1>
          </div>
          <button className="scan-qr-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </header>

        <div className="scan-qr-content">
        {!isOnline && (
          <div className="offline-scan-badge">
            <span className="material-symbols-outlined">cloud_off</span>
            <span>{t('scanQR.offlineMode') || 'Offline - scans will sync later'}</span>
          </div>
        )}

        {offlineQueued && (
          <div className="offline-queued-badge">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{t('scanQR.scanQueued') || 'Scan queued for sync'}</span>
          </div>
        )}

        {cameraError ? (
          <div className="scan-qr-error">
            <Camera size={48} strokeWidth={1.5} />
            <h2>{cameraError === 'denied' ? t('scanQR.cameraDeniedTitle') : t('scanQR.cameraError')}</h2>
            <p>{cameraError === 'denied' ? t('scanQR.cameraDeniedDesc') : t('scanQR.cameraErrorDesc')}</p>
            <div className="scan-qr-error-actions">
              {cameraError === 'denied' ? (
                <button className="btn-primary" onClick={() => window.location.reload()}>
                  <Camera size={20} />
                  {t('scanQR.reloadPage')}
                </button>
              ) : (
                <button className="btn-primary" onClick={() => { setCameraError(null); hasStartedRef.current = false; startCamera(); }}>
                  <Camera size={20} />
                  {t('scanQR.retryCamera', 'Retry Camera')}
                </button>
              )}
              <button className="btn-primary scan-qr-secondary-btn" onClick={() => setShowManualInput(true)}>
                <Search size={20} />
                {t('scanQR.manualEntry')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="scan-qr-scanner">
              <div id="qr-reader" className="scan-qr-reader" />
              <div className="scan-qr-overlay">
                <div className="scan-qr-frame" />
              </div>
              {!scanning && cameraError === null && (
                <div className="scan-qr-loading">{t('common.loading')}</div>
              )}
            </div>

            <p className="scan-qr-instruction">{t('scanQR.instruction')}</p>

            {error && <div className="scan-qr-error-message">{error}</div>}

            <button
              className="scan-qr-manual-btn"
              onClick={() => setShowManualInput(true)}
            >
              <Search size={18} />
              {t('scanQR.manualEntry')}
            </button>
          </>
        )}
        </div>
      </div>

      {/* Customer Search Modal */}
      {showManualInput && (
        <div className="modal-overlay" onClick={() => { setShowManualInput(false); setSearchQuery(''); setSearchResults([]); }}>
          <div className="modal-content customer-search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="customer-search-header">
              <h3>{t('scanQR.searchCustomerTitle')}</h3>
              <button className="modal-close-btn" onClick={() => { setShowManualInput(false); setSearchQuery(''); setSearchResults([]); }} aria-label={t('scanQR.cancel')}>
                <X size={20} />
              </button>
            </div>
            <div className="customer-search-input-wrap">
              <Search size={18} className="customer-search-icon" />
              <input
                type="text"
                className="customer-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('scanQR.searchPlaceholder')}
                autoFocus
              />
            </div>
            <div className="customer-search-results">
              {searchQuery.trim().length < 2 ? (
                <p className="customer-search-empty">{t('scanQR.searchHint')}</p>
              ) : searchLoading ? (
                <p className="customer-search-empty">{t('common.loading')}</p>
              ) : searchResults.length === 0 ? (
                <p className="customer-search-empty">{t('scanQR.searchNoResults')}</p>
              ) : (
                searchResults.map((c) => (
                  <button
                    key={c.customerId}
                    className="customer-search-result"
                    onClick={() => handlePickResult(c)}
                  >
                    <div className="customer-search-avatar">
                      <User size={20} />
                    </div>
                    <div className="customer-search-info">
                      <div className="customer-search-name">{c.firstName} {c.lastName}</div>
                      <div className="customer-search-meta">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
                    </div>
                    <div className="customer-search-points">{c.pointsBalance}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Modal */}
      {customer && <CustomerProfileModal customer={customer} onClose={handleCloseModal} initialView={mode} />}
    </div>
  );
}
