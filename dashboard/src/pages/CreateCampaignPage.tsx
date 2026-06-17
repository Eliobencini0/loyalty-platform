import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createCampaign, type GameType, type PrizeType } from '../api';

interface PrizeForm {
  name: string;
  description: string;
  prizeType: PrizeType;
  prizeValue: string;
  probability: number;
  validityDays: number;
}

function getErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export default function CreateCampaignPage() {
  const DEFAULT_VALIDITY_DAYS = 15;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameType, setGameType] = useState<GameType>('SCRATCH_CARD');
  const [prizes, setPrizes] = useState<PrizeForm[]>([
    { name: '', description: '', prizeType: 'PHYSICAL', prizeValue: '', probability: 100, validityDays: DEFAULT_VALIDITY_DAYS },
  ]);

  const addPrize = () => {
    setPrizes([
      ...prizes,
      { name: '', description: '', prizeType: 'PHYSICAL', prizeValue: '', probability: 10, validityDays: DEFAULT_VALIDITY_DAYS },
    ]);
  };

  const removePrize = (index: number) => {
    if (prizes.length > 1) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  const updatePrize = <K extends keyof PrizeForm>(index: number, field: K, value: PrizeForm[K]) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (prizes.some((p) => !p.name.trim())) {
      setError(t('campaigns.prizeNameRequired', 'All prizes must have a name'));
      return;
    }

    const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
    if (totalProbability === 0) {
      setError(t('campaigns.probabilityRequired', 'Total probability must be greater than 0'));
      return;
    }

    setLoading(true);
    try {
      await createCampaign({
        gameType,
        prizes: prizes.map((p) => ({
          name: p.name.trim(),
          description: p.description.trim() || undefined,
          prizeType: p.prizeType,
          prizeValue: p.prizeValue.trim() || undefined,
          probability: p.probability,
          validityDays: p.validityDays,
        })),
      });

      navigate('/campaigns');
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t('campaigns.createError', 'Failed to create campaign'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page stack-lg">
      <header className="app-page-header">
        <div className="app-page-header-row">
          <button className="app-page-back" onClick={() => navigate('/campaigns')}>
          <X size={24} />
        </button>
          <div className="app-page-header-copy">
            <h1 className="app-page-title">{t('campaigns.createNew', 'Create Campaign')}</h1>
          </div>
        </div>
        <p className="app-page-subtitle">
          {t('campaigns.prizesHint', 'Configure at least one prize, its probability weight, and how many days the win stays valid.')}
        </p>
      </header>

        <form onSubmit={handleSubmit} className="app-form-card app-form-stack">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <section className="app-form-section">
            <div className="app-section-header">
              <div>
                <span className="section-kicker">{t('campaigns.gameType', 'Game Type')}</span>
                <h2 className="app-section-title">{t('campaigns.gameType', 'Game Type')}</h2>
              </div>
            </div>
            <div className="app-choice-grid">
              <label className={`app-choice-card ${gameType === 'SCRATCH_CARD' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="SCRATCH_CARD"
                  checked={gameType === 'SCRATCH_CARD'}
                  onChange={(e) => setGameType(e.target.value as GameType)}
                />
                <div className="app-choice-card-body">
                  <div className="app-choice-title">{t('campaigns.scratchCard', 'Scratch Card')}</div>
                </div>
              </label>
              <label className={`app-choice-card ${gameType === 'SPIN_WHEEL' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="SPIN_WHEEL"
                  checked={gameType === 'SPIN_WHEEL'}
                  onChange={(e) => setGameType(e.target.value as GameType)}
                />
                <div className="app-choice-card-body">
                  <div className="app-choice-title">{t('campaigns.spinWheel', 'Spin Wheel')}</div>
                </div>
              </label>
            </div>
          </section>

          <section className="app-form-section">
            <div className="app-section-header">
              <div>
                <span className="section-kicker">{t('campaigns.prizes', 'Prizes')}</span>
                <h2 className="app-section-title">{t('campaigns.prizes', 'Prizes')}</h2>
                <p className="app-section-subtitle">{t('campaigns.prizesHint', 'Configure at least one prize, its probability weight, and how many days the win stays valid.')}</p>
              </div>
              <button type="button" className="btn btn-secondary app-pill-button" onClick={addPrize}>
                <Plus size={16} />
                {t('campaigns.addPrize', 'Add Prize')}
              </button>
            </div>

            <div className="app-summary-card">
              <div className="app-meta-list">
                <div className="app-meta-row">
                  <span className="app-meta-label">{t('campaigns.configuredPrizes', 'Configured prizes')}</span>
                  <span className="app-meta-value">{prizes.length}</span>
                </div>
                <div className="app-meta-row">
                  <span className="app-meta-label">{t('campaigns.totalWeight', 'Total weight')}</span>
                  <span className="app-meta-value">
                    {prizes.reduce((sum, prize) => sum + prize.probability, 0)}
                  </span>
                </div>
                <div className="app-meta-row">
                  <span className="app-meta-label">{t('campaigns.defaultValidity', 'Default validity')}</span>
                  <span className="app-meta-value">
                    {DEFAULT_VALIDITY_DAYS} {t('campaigns.days', 'days')}
                  </span>
                </div>
              </div>
            </div>

            {prizes.map((prize, index) => (
              <div key={index} className="app-prize-card">
                <div className="app-prize-header">
                  <span className="app-prize-title">{t('campaigns.prize', 'Prize')} #{index + 1}</span>
                  {prizes.length > 1 && (
                    <button
                      type="button"
                      className="app-action-icon app-action-icon-danger"
                      onClick={() => removePrize(index)}
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>{t('campaigns.prizeName', 'Prize Name')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prize.name}
                    onChange={(e) => updatePrize(index, 'name', e.target.value)}
                    placeholder={t('campaigns.prizeNamePlaceholder', 'Free coffee')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('campaigns.description', 'Description')}</label>
                  <textarea
                    className="form-input"
                    value={prize.description}
                    onChange={(e) => updatePrize(index, 'description', e.target.value)}
                    placeholder={t('campaigns.prizeDescriptionPlaceholder', 'Small description shown to the customer')}
                    rows={2}
                  />
                </div>

                <div className="app-form-grid app-form-grid-3">
                  <div className="form-group">
                    <label>{t('campaigns.prizeType', 'Type')}</label>
                    <select
                      className="form-input"
                      value={prize.prizeType}
                      onChange={(e) => updatePrize(index, 'prizeType', e.target.value as PrizeType)}
                    >
                      <option value="PHYSICAL">{t('campaigns.physical', 'Physical')}</option>
                      <option value="DIGITAL">{t('campaigns.digital', 'Digital')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t('campaigns.probability', 'Weight')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={prize.probability}
                      onChange={(e) => updatePrize(index, 'probability', parseInt(e.target.value) || 0)}
                      min="1"
                      max="100"
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('campaigns.validity', 'Valid Days')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={prize.validityDays}
                      onChange={(e) => updatePrize(index, 'validityDays', parseInt(e.target.value) || DEFAULT_VALIDITY_DAYS)}
                      min="1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/campaigns')}
              disabled={loading}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.creating', 'Creating...') : t('campaigns.create', 'Create Campaign')}
            </button>
          </div>
        </form>
    </div>
  );
}
