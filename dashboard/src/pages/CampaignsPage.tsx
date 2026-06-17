import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Play, Pause, Pencil, Trash2, Plus, Sparkles, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteCampaign, listCampaigns, updateCampaign, type Campaign } from '../api';

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await listCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCampaigns();
  }, []);

  const toggleActive = async (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateCampaign(campaign.id, { active: !campaign.active });
      void loadCampaigns();
    } catch (err) {
      console.error('Failed to toggle campaign:', err);
    }
  };

  const handleDelete = async (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      t('campaigns.deleteConfirm', 'Delete this campaign? This action cannot be undone.'),
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteCampaign(campaign.id);
      setCampaigns((current) => current.filter((item) => item.id !== campaign.id));
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  return (
    <div className="app-page stack-lg">
      <header className="app-page-header">
        <div className="app-page-header-row">
          <button className="app-page-back" onClick={() => navigate('/menu')}>
            <ArrowLeft size={20} />
          </button>
          <div className="app-page-header-copy">
            <h1 className="app-page-title">{t('campaigns.title', 'Campaigns')}</h1>
          </div>
          {campaigns.length > 0 && (
            <button className="btn btn-primary btn-sm app-header-cta" onClick={() => navigate('/campaigns/new')}>
              <Plus size={16} />
              {t('campaigns.new', 'New')}
            </button>
          )}
        </div>
      </header>

      {/* How-it-works educational card */}
      <section className="app-surface-card">
        <div className="app-surface-body stack-md">
          <span className="app-page-kicker">{t('campaigns.howItWorks', 'How it works')}</span>
          <ul className="review-flow-steps">
            <li>
              <span className="review-flow-icon review-flow-icon-success" aria-hidden="true">
                <Sparkles size={16} />
              </span>
              <div>
                <strong>{t('campaigns.step1', 'Customers play')}</strong>
                <p>{t('campaigns.step1Desc', 'They scan your QR and try a scratch card or spin wheel.')}</p>
              </div>
            </li>
            <li>
              <span className="review-flow-icon review-flow-icon-private" aria-hidden="true">
                <Trophy size={16} />
              </span>
              <div>
                <strong>{t('campaigns.step2', 'They win prizes')}</strong>
                <p>{t('campaigns.step2Desc', 'You set the prizes and probability — the rest is automatic.')}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">{t('common.loading', 'Loading...')}</div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="app-surface-card app-surface-card-muted">
          <div className="app-surface-body empty-state">
          <div className="empty-state-icon">🎮</div>
          <div className="empty-state-title">{t('campaigns.empty', 'No campaigns yet')}</div>
          <div className="empty-state-desc">
            {t('campaigns.emptyDesc', 'Create your first gamification campaign to engage customers')}
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/campaigns/new')}>
            <Plus size={20} />
            {t('campaigns.createFirst', 'Create Campaign')}
          </button>
          </div>
        </div>
      ) : (
        <div className="app-card-grid">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="app-surface-card"
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
            >
              <div className="app-surface-body">
              <div className="app-surface-header">
                <div>
                  <span className="section-kicker">
                    {campaign.gameType === 'SCRATCH_CARD'
                      ? t('campaigns.scratchCard', 'Scratch Card')
                      : t('campaigns.spinWheel', 'Spin Wheel')}
                  </span>
                  <h3 className="app-surface-title">{campaign.name}</h3>
                  {campaign.description && (
                    <p className="app-surface-subtitle">{campaign.description}</p>
                  )}
                </div>
                <div className="app-inline-actions">
                  <button
                    className="app-action-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/campaigns/${campaign.id}/edit`);
                    }}
                    aria-label={t('campaigns.editCampaign', 'Edit Campaign')}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="app-action-icon app-action-icon-danger"
                    onClick={(e) => handleDelete(campaign, e)}
                    aria-label={t('campaigns.deleteCampaign', 'Delete Campaign')}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    className="app-action-icon"
                    onClick={(e) => toggleActive(campaign, e)}
                    aria-label={campaign.active ? 'Pause' : 'Activate'}
                  >
                    {campaign.active ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              </div>
              <div className="app-meta-list">
                <div className="app-meta-row">
                  <span className="app-meta-label">{t('campaigns.prizes', 'Prizes')}</span>
                  <span className="app-meta-value">{campaign.prizes.length}</span>
                </div>
                <div className="app-meta-row">
                  <span className="app-meta-label">{t('campaigns.plays', 'Total Plays')}</span>
                  <span className="app-meta-value">{campaign._count?.prizeWins || 0}</span>
                </div>
                <div className="app-meta-row">
                  <span className="app-meta-label">{t('campaigns.status', 'Status')}</span>
                  <span className={`app-status-pill app-status-pill-${campaign.active ? 'ok' : 'warn'}`}>
                    <span className="app-status-pill-dot" aria-hidden="true" />
                    {campaign.active
                      ? t('campaigns.active', 'Active')
                      : t('campaigns.inactive', 'Inactive')}
                  </span>
                </div>
              </div>
              <div className="campaign-card-footer">
                <button
                  className="btn btn-secondary app-pill-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/campaigns/${campaign.id}`);
                  }}
                >
                  <BarChart3 size={16} />
                  {t('campaigns.viewStats', 'View Stats')}
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
