import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { api } from '../services/api';
import { 
  Bot, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Play,
  Heart,
  ChevronRight
} from 'lucide-react';

export function AgentPage() {
  const { t } = useLanguage();
  const { userId, location } = useEmergency();

  const [category, setCategory] = useState('cardiac');
  const [heartRate, setHeartRate] = useState(128);
  const [spo2, setSpo2] = useState(91);
  const [systolicBp, setSystolicBp] = useState(145);
  const [patientNotes, setPatientNotes] = useState('Severe crushing central chest pain radiating to left jaw, diaphoresis.');
  const [loading, setLoading] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [authorizedActions, setAuthorizedActions] = useState({});

  const handleRunAgent = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        user_id: userId,
        category,
        latitude: location?.latitude || 13.9824,
        longitude: location?.longitude || 74.5516,
        user_query: patientNotes,
        vital_signs: {
          heart_rate: Number(heartRate),
          oxygen_saturation: Number(spo2),
          systolic_bp: Number(systolicBp)
        },
        require_dispatch_approval: true
      };

      const res = await api.coordinateAgent(payload);
      setAgentResult(res);
    } catch (err) {
      console.warn('Agent coordination failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = (idx) => {
    setAuthorizedActions(prev => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Bot size={28} color="var(--color-primary)" />
          <h1 style={{ fontSize: '2rem' }}>{t('ai_title')}</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Autonomous multi-tool emergency reasoning with clinical triage assessment, evidence validation, and user authorization gates.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Intake Parameters */}
        <div>
          <div className="card" style={{ marginBottom: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Activity size={18} color="var(--color-primary)" />
              <span>Patient Intake Parameters</span>
            </h3>

            <form onSubmit={handleRunAgent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Emergency Category
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
                  <option value="cardiac">Cardiac / Heart Attack</option>
                  <option value="road_accident">Road Traffic Accident</option>
                  <option value="severe_trauma">Severe Hemorrhage / Trauma</option>
                  <option value="respiratory">Respiratory Distress</option>
                  <option value="stroke">Stroke (FAST)</option>
                  <option value="general">General Triage</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Heart Rate (BPM): <strong>{heartRate}</strong>
                </label>
                <input
                  type="range"
                  min="40"
                  max="190"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  SpO2 Oxygen (%): <strong>{spo2}%</strong>
                </label>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Systolic Blood Pressure (mmHg): <strong>{systolicBp}</strong>
                </label>
                <input
                  type="range"
                  min="70"
                  max="220"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Reported Symptoms / Query
                </label>
                <textarea
                  rows="3"
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '6px', justifyContent: 'center' }}>
                <Play size={16} />
                <span>{loading ? 'Executing Agent Workflow...' : 'Execute Agent Coordination'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns (2 Spans): Coordinator Output */}
        <div style={{ gridColumn: 'span 2' }}>
          {agentResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Executive Summary Card */}
              <div className="card" style={{ borderLeft: '4px solid var(--color-primary)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-emergency" style={{ fontSize: '0.85rem' }}>
                    URGENCY: {agentResult.urgency_level}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Execution: {agentResult.execution_time_ms} ms
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Coordinator Synthesis
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {agentResult.summary}
                </p>
              </div>

              {/* Explainable Reasoning Trace */}
              <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <Cpu size={18} color="var(--color-primary)" />
                  <span>{t('ai_reasoning_trace')}</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {agentResult.reasoning_trace?.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-soft-blue)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, border: '1px solid #BAE6FD' }}>
                        {idx + 1}
                      </div>
                      <span style={{ color: 'var(--text-primary)', lineHeight: 1.4, paddingTop: '2px' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured Tool Executions Trace */}
              <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <ShieldCheck size={18} color="var(--color-success)" />
                  <span>{t('ai_tools_executed')} ({agentResult.tool_executions?.length})</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {agentResult.tool_executions?.map((tool, idx) => (
                    <div key={idx} style={{ background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{tool.tool_name}</strong>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Validated</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Source: {tool.evidence_source}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Timestamp: {new Date(tool.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vetted First-Aid Protocol */}
              <div className="card" style={{ background: 'var(--bg-soft-blue)', borderColor: '#BAE6FD', boxShadow: 'none' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {agentResult.first_aid?.title}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Evidence Source: <strong style={{ color: 'var(--color-primary)' }}>{agentResult.first_aid?.source}</strong>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '8px' }}>Immediate Actions:</div>
                  <ol style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {agentResult.first_aid?.steps?.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {agentResult.first_aid?.warnings?.length > 0 && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '6px', padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-danger)', marginBottom: '4px' }}>Critical Warnings:</div>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#991B1B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {agentResult.first_aid?.warnings?.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* User Authorization Gates */}
              {agentResult.actions_awaiting_approval?.length > 0 && (
                <div className="card" style={{ border: '1px solid #FDE68A', background: '#FFFBEB' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#B45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    <span>{t('ai_approvals_required')}</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#78350F', marginBottom: '12px' }}>
                    In accordance with safety rules, consequential external actions require explicit patient authorization before dispatch.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {agentResult.actions_awaiting_approval.map((action, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FFFFFF', border: '1px solid #FDE68A', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{action}</span>
                        <button
                          onClick={() => handleAuthorize(idx)}
                          className="btn"
                          disabled={authorizedActions[idx]}
                          style={{
                            background: authorizedActions[idx] ? 'var(--color-success)' : 'var(--color-primary)',
                            color: 'white',
                            fontSize: '0.8rem',
                            padding: '6px 14px'
                          }}
                        >
                          {authorizedActions[idx] ? '✓ Authorized' : t('authorize_action')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <Bot size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Coordinator Idle</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto', color: 'var(--text-secondary)' }}>
                Set patient vital signs on the left and click "Execute Agent Coordination" to observe multi-tool reasoning and clinical recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
