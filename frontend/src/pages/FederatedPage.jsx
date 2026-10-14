import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Cpu, 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  Play, 
  TrendingUp, 
  Database, 
  Award,
  Layers,
  Lock
} from 'lucide-react';

export function FederatedPage() {
  const { t } = useLanguage();
  const [flData, setFlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runningExperiment, setRunningExperiment] = useState(false);
  const [runMessage, setRunMessage] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getFederatedStatus();
      setFlData(data);
    } catch (err) {
      console.warn('Failed to load FL status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRunNewExperiment = async () => {
    setRunningExperiment(true);
    setRunMessage('Executing 5 FedAvg rounds across 3 simulated hospitals...');
    try {
      const res = await api.runFederatedExperiment(5);
      setRunMessage(res.message);
      setFlData(res.results);
    } catch (err) {
      setRunMessage(`Experiment failed: ${err.message}`);
    } finally {
      setRunningExperiment(false);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Cpu size={28} color="#a855f7" />
            <h1 style={{ fontSize: '2rem' }}>{t('federated_learning')}</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Multi-hospital privacy-preserving machine learning for emergency ICU triage prediction using FedAvg.
          </p>
        </div>

        <button
          onClick={handleRunNewExperiment}
          disabled={runningExperiment}
          className="btn"
          style={{ background: '#a855f7', color: 'white', fontWeight: 600 }}
        >
          <Play size={16} />
          <span>{runningExperiment ? 'Training 5 Rounds...' : 'Run New 5-Round Experiment'}</span>
        </button>
      </div>

      {runMessage && (
        <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#d8b4fe', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.88rem' }}>
          {runMessage}
        </div>
      )}

      {/* Model Spec & Privacy Guarantee Banner */}
      <div className="card" style={{ marginBottom: '25px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(2, 132, 199, 0.05) 100%)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <Lock size={24} color="#a855f7" style={{ flexShrink: 0, marginTop: '3px' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Federated Averaging (FedAvg) Privacy Architecture
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Raw patient vital signs remain strictly inside each hospital client. Only mathematical model weight parameters ($\Delta W$) are communicated to the aggregation server. Centralized ceiling comparison is evaluated on an independent held-out clinical test set.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Simulated Hospital Clients */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>Participating Hospital Clients</h2>
        <div className="grid grid-cols-3 gap-6">
          {flData?.clients?.map((client, idx) => (
            <div key={idx} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="badge badge-info">Client {idx + 1}</span>
                <span className="badge badge-success">Connected</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                {client.hospital_name}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Type: {client.facility_type}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Cohort: {client.data_characteristics}
              </div>
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--bg-card-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Local Sample Count:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{client.sample_count} patients</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Performance Comparison: FedAvg vs Centralized Baseline */}
      {flData?.latest_global_metrics && (
        <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '30px' }}>
          {/* Global FedAvg Model */}
          <div className="card" style={{ border: '2px solid #a855f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="#a855f7" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Global FedAvg Model (Round {flData.total_rounds_completed})</h3>
              </div>
              <span className="badge badge-success">Zero Data Shared</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Test Accuracy</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7' }}>
                  {flData.latest_global_metrics.accuracy}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>F1-Score</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
                  {flData.latest_global_metrics.f1_score}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Precision</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#4ade80' }}>
                  {flData.latest_global_metrics.precision}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loss</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fb923c' }}>
                  {flData.latest_global_metrics.loss}
                </div>
              </div>
            </div>
          </div>

          {/* Centralized Baseline Comparison */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Centralized Baseline (Theoretical Ceiling)</h3>
              </div>
              <span className="badge badge-warning">Pooled Data</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Test Accuracy</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {flData.baseline_metrics?.accuracy}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>F1-Score</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>
                  {flData.baseline_metrics?.f1_score}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Precision</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#4ade80' }}>
                  {flData.baseline_metrics?.precision}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loss</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fb923c' }}>
                  {flData.baseline_metrics?.loss}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Round Progression Table */}
      {flData?.rounds?.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Training Rounds Progression</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bg-card-border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Round</th>
                  <th style={{ padding: '10px' }}>Global Test Acc</th>
                  <th style={{ padding: '10px' }}>Global F1</th>
                  <th style={{ padding: '10px' }}>Global Loss</th>
                  <th style={{ padding: '10px' }}>Participating Clients</th>
                  <th style={{ padding: '10px' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {flData.rounds.map((r) => (
                  <tr key={r.round_number} style={{ borderBottom: '1px solid var(--bg-card-border)' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#a855f7' }}>Round {r.round_number}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#4ade80' }}>{r.global_metrics.accuracy}%</td>
                    <td style={{ padding: '10px' }}>{r.global_metrics.f1_score}%</td>
                    <td style={{ padding: '10px' }}>{r.global_metrics.loss}</td>
                    <td style={{ padding: '10px' }}>3 Hospitals</td>
                    <td style={{ padding: '10px' }}>{r.training_duration_seconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
