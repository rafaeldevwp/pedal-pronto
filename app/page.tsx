'use client';
import { useEffect, useState } from 'react';
import {
  Activity,
  Bike,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  HeartPulse,
  Link2,
  Moon,
  RefreshCw,
  ShieldCheck,
  Waves,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

type Tab = 'hoje' | 'recuperacao' | 'treinos';
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
type Result = {
  classification: 'verde' | 'amarela' | 'vermelha' | 'indisponível';
  score: number;
  changed: boolean;
  title: string;
  summary: string;
  evidence: string[];
  recovery: string;
  workout: {
    name: string;
    durationMinutes?: number;
    load?: number;
    action: string;
  } | null;
  metrics: {
    sleepHours?: number;
    sleepScore?: number;
    hrv?: number;
    restingHr?: number;
    ansCharge?: number;
    nightlyStatus?: number;
    ctl?: number;
    atl?: number;
    form?: number;
    ramp?: number;
  };
  updatedAt: string;
  warning?: string;
};

export default function Home() {
  const [tab, setTab] = useState<Tab>('hoje'),
    [details, setDetails] = useState(false),
    [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null),
    [saved, setSaved] = useState(false),
    [polarConnected, setPolarConnected] = useState<boolean | null>(null),
    [result, setResult] = useState<Result | null>(null),
    [loading, setLoading] = useState(false),
    [checkin, setCheckin] = useState({ fadiga: 4, dor: 1, estresse: 3 });
  useEffect(() => {
    if ('serviceWorker' in navigator)
      navigator.serviceWorker.register('/sw.js');
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const stored = localStorage.getItem('pedal-pronto-checkin');
    if (stored) setCheckin(JSON.parse(stored));
    fetch('/api/polar/status')
      .then((r) => (r.ok ? r.json() : { connected: false }))
      .then((r) => {
        setPolarConnected(r.connected);
        if (r.connected) loadReadiness(false);
      })
      .catch(() => setPolarConnected(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  async function loadReadiness(apply: boolean) {
    setLoading(true);
    try {
      const r = await fetch('/api/readiness', {
        method: apply ? 'POST' : 'GET',
        headers: apply ? { 'Content-Type': 'application/json' } : undefined,
        body: apply ? JSON.stringify({ checkin }) : undefined,
      });
      if (r.ok) setResult(await r.json());
    } finally {
      setLoading(false);
    }
  }
  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }
  function saveCheckin() {
    localStorage.setItem('pedal-pronto-checkin', JSON.stringify(checkin));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }
  const status = result?.classification || 'indisponível';
  const metrics = [
    {
      icon: Moon,
      label: 'Sono',
      value: result?.metrics.sleepHours
        ? `${result.metrics.sleepHours} h`
        : '—',
      note: result?.metrics.sleepScore
        ? `Qualidade ${result.metrics.sleepScore}`
        : 'Aguardando dados',
    },
    {
      icon: Waves,
      label: 'HRV',
      value: result?.metrics.hrv ? `${Math.round(result.metrics.hrv)} ms` : '—',
      note:
        result?.metrics.ansCharge !== undefined
          ? `ANS ${result.metrics.ansCharge.toFixed(1)}`
          : 'Linha de base',
    },
    {
      icon: HeartPulse,
      label: 'FC noturna',
      value: result?.metrics.restingHr
        ? `${result.metrics.restingHr} bpm`
        : '—',
      note:
        result?.metrics.form !== undefined
          ? `Forma ${result.metrics.form.toFixed(0)}`
          : 'Tendência',
    },
  ];
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">
          <Bike size={20} />
        </div>
        <div>
          <p className="eyebrow">PEDAL PRONTO</p>
          <h1>
            {tab === 'hoje'
              ? 'Bom dia, Rafael'
              : tab === 'recuperacao'
                ? 'Sua recuperação'
                : 'Plano de treinos'}
          </h1>
        </div>
        {installPrompt ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Instalar aplicativo"
            onClick={install}
          >
            <Download />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sincronizar dados"
            onClick={() => loadReadiness(false)}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'spin' : ''} />
          </Button>
        )}
      </header>
      {tab === 'hoje' && (
        <section className="connection-strip">
          <div>
            <Link2 size={18} />
            <span>
              <strong>Polar Flow + Intervals.icu</strong>
              <small>
                {polarConnected === null
                  ? 'Verificando conexões…'
                  : polarConnected
                    ? 'Conectados com segurança'
                    : 'Polar precisa ser conectado'}
              </small>
            </span>
          </div>
          {polarConnected === false ? (
            <Button asChild size="sm">
              <a href="/api/polar/connect">Conectar</a>
            </Button>
          ) : (
            <Badge variant="outline">
              <Check size={14} /> Ativos
            </Badge>
          )}
        </section>
      )}
      {tab === 'hoje' && (
        <>
          <section className={`readiness-card status-${status}`}>
            <div className="readiness-topline">
              <Badge className="status-badge">
                PRONTIDÃO {status.toUpperCase()}
              </Badge>
              <span>
                {result
                  ? `Atualizado ${new Date(result.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Carregando dados reais'}
              </span>
            </div>
            <div className="score-row">
              <div className="score-ring">
                <span>{result?.score ?? '—'}</span>
                <small>/ 5</small>
              </div>
              <div>
                <h2>{result?.title || 'Avaliando recuperação'}</h2>
                <p>
                  {result?.summary ||
                    'Cruzando sono, tendência e carga recente.'}
                </p>
              </div>
            </div>
            <div className="metric-grid">
              {metrics.map(({ icon: Icon, ...m }) => (
                <div className="metric" key={m.label}>
                  <Icon size={17} />
                  <span>{m.label}</span>
                  <strong>{m.value}</strong>
                  <small>{m.note}</small>
                </div>
              ))}
            </div>
          </section>
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">TREINO DE HOJE</p>
                <h2>{result?.workout?.name || 'Nenhum treino carregado'}</h2>
              </div>
              {result?.workout?.durationMinutes && (
                <Badge variant="outline">
                  {result.workout.durationMinutes} min
                </Badge>
              )}
            </div>
            <Card className="workout-card">
              <CardHeader className="workout-summary">
                <div className="workout-icon">
                  <Activity />
                </div>
                <div>
                  <strong>
                    {result?.changed
                      ? 'TREINO ALTERADO — alteração aplicada'
                      : 'Plano protegido'}
                  </strong>
                  <span>
                    {result?.workout?.load
                      ? `Nova carga prevista ${result.workout.load}`
                      : 'Carga será preservada quando os dados forem insuficientes'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="change-note">
                  <ShieldCheck size={18} />
                  <p>
                    <strong>
                      {result?.changed
                        ? 'Mudança concluída no Intervals.icu'
                        : 'Decisão conservadora'}
                    </strong>
                    <br />
                    {result?.workout?.action ||
                      result?.summary ||
                      'Nenhuma alteração sem dados completos.'}
                  </p>
                </div>
                <Button
                  className="primary-action"
                  onClick={() => loadReadiness(true)}
                  disabled={loading || !polarConnected}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="spin" /> Atualizando…
                    </>
                  ) : (
                    'Atualizar treino agora'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="details-action"
                  onClick={() => setDetails(!details)}
                >
                  Dados que sustentam a decisão{' '}
                  {details ? <ChevronDown /> : <ChevronRight />}
                </Button>
                {details && (
                  <div className="steps">
                    {result?.evidence.map((e, i) => (
                      <p key={i}>• {e}</p>
                    ))}
                    <p>
                      <strong>Recuperação:</strong> {result?.recovery}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
      {tab === 'recuperacao' && (
        <section className="panel-stack">
          <Card className="checkin-card">
            <CardHeader>
              <p className="eyebrow">CHECK-IN RÁPIDO</p>
              <h2>Como você está agora?</h2>
              <p className="muted-copy">
                Dor e sintomas prevalecem sobre o relógio. O check-in será
                considerado na atualização manual.
              </p>
            </CardHeader>
            <CardContent className="slider-list">
              {Object.entries(checkin).map(([key, value]) => (
                <label key={key}>
                  <span>
                    <strong>{key[0].toUpperCase() + key.slice(1)}</strong>
                    <b>{value}</b>
                  </span>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[value]}
                    onValueChange={(v) =>
                      setCheckin({ ...checkin, [key]: v[0] })
                    }
                  />
                </label>
              ))}
              <Button className="primary-action" onClick={saveCheckin}>
                {saved ? (
                  <>
                    <Check /> Check-in salvo
                  </>
                ) : (
                  'Salvar check-in'
                )}
              </Button>
            </CardContent>
          </Card>
          {result && (
            <div className="trend-card">
              <p className="eyebrow">CARGA E FORMA</p>
              <h2>
                Fitness {result.metrics.ctl?.toFixed(0) ?? '—'} · Fadiga{' '}
                {result.metrics.atl?.toFixed(0) ?? '—'}
              </h2>
              <p className="muted-copy">
                Forma {result.metrics.form?.toFixed(0) ?? '—'} · Rampa{' '}
                {result.metrics.ramp?.toFixed(1) ?? '—'}
              </p>
            </div>
          )}
        </section>
      )}
      {tab === 'treinos' && (
        <section className="panel-stack">
          <div className="week-summary">
            <div>
              <p className="eyebrow">TREINO ATUAL</p>
              <h2>{result?.workout?.name || 'Aguardando calendário'}</h2>
            </div>
            <Badge variant="outline">
              {result?.changed ? 'Alterado hoje' : 'Sem alteração'}
            </Badge>
          </div>
          <Card className="day-card">
            <div
              className={`day-dot ${status === 'verde' ? 'green' : status === 'amarela' ? 'yellow' : 'rest'}`}
            />
            <div>
              <small>Hoje</small>
              <strong>{result?.workout?.name || 'Nenhum treino'}</strong>
              <span>
                {result?.workout?.durationMinutes
                  ? `${result.workout.durationMinutes} min`
                  : result?.summary}
              </span>
            </div>
            <ChevronRight />
          </Card>
        </section>
      )}
      {installPrompt && (
        <button className="install-banner" onClick={install}>
          <Download size={18} />
          <span>
            <strong>Instalar Pedal Pronto</strong>
            <small>Use como app no celular</small>
          </span>
          <ChevronRight size={18} />
        </button>
      )}
      <nav className="bottom-nav" aria-label="Navegação principal">
        <button
          className={tab === 'hoje' ? 'active' : ''}
          onClick={() => setTab('hoje')}
        >
          <Activity />
          <span>Hoje</span>
        </button>
        <button
          className={tab === 'recuperacao' ? 'active' : ''}
          onClick={() => setTab('recuperacao')}
        >
          <Moon />
          <span>Recuperação</span>
        </button>
        <button
          className={tab === 'treinos' ? 'active' : ''}
          onClick={() => setTab('treinos')}
        >
          <Bike />
          <span>Treinos</span>
        </button>
      </nav>
    </main>
  );
}
