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
const metrics = [
  { icon: Moon, label: 'Sono', value: '9h15', note: 'Qualidade 81' },
  { icon: Waves, label: 'HRV', value: '138 ms', note: 'Faixa habitual' },
  {
    icon: HeartPulse,
    label: 'FC noturna',
    value: '53 bpm',
    note: 'Acima da base',
  },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('hoje');
  const [details, setDetails] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(
    null,
  );
  const [saved, setSaved] = useState(false);
  const [polarConnected, setPolarConnected] = useState<boolean | null>(null);
  const [checkin, setCheckin] = useState({ fadiga: 4, dor: 1, estresse: 3 });
  useEffect(() => {
    if ('serviceWorker' in navigator)
      navigator.serviceWorker.register('/sw.js');
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const stored = localStorage.getItem('pedal-pronto-checkin');
    if (stored) setCheckin(JSON.parse(stored));
    fetch('/api/polar/status')
      .then((r) => (r.ok ? r.json() : { connected: false }))
      .then((r) => setPolarConnected(r.connected))
      .catch(() => setPolarConnected(false));
    if (new URLSearchParams(location.search).get('polar') === 'connected') {
      setPolarConnected(true);
      history.replaceState({}, '', '/');
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
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
          <Button variant="ghost" size="icon" aria-label="Sincronizar dados">
            <RefreshCw />
          </Button>
        )}
      </header>
      {tab === 'hoje' && (
        <section className="connection-strip">
          <div>
            <Link2 size={18} />
            <span><strong>Polar Flow</strong><small>{polarConnected === null ? 'Verificando conexão…' : polarConnected ? 'Conectado com segurança' : 'Conecte para usar seus dados reais'}</small></span>
          </div>
          {polarConnected === false && <Button asChild size="sm"><a href="/api/polar/connect">Conectar</a></Button>}
          {polarConnected && <Badge variant="outline"><Check size={14} /> Ativo</Badge>}
        </section>
      )}
      {tab === 'hoje' && (
        <>
          <section className="readiness-card">
            <div className="readiness-topline">
              <Badge className="status-badge">PRONTIDÃO AMARELA</Badge>
              <span>Atualizado às 06:15</span>
            </div>
            <div className="score-row">
              <div className="score-ring">
                <span>2</span>
                <small>/ 5</small>
              </div>
              <div>
                <h2>Recuperação incompleta</h2>
                <p>
                  Sono suficiente, mas o sistema autonômico ainda pede cautela.
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
                <h2>VO₂ 5×3 a 305 W</h2>
              </div>
              <Badge variant="outline">60 min</Badge>
            </div>
            <Card className="workout-card">
              <CardHeader className="workout-summary">
                <div className="workout-icon">
                  <Activity />
                </div>
                <div>
                  <strong>C1W2D2 · Indoor</strong>
                  <span>Carga prevista 76 · Intensidade 87%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="change-note">
                  <ShieldCheck size={18} />
                  <p>
                    <strong>Ajuste seguro aplicado</strong>
                    <br />
                    Uma repetição a menos; potência e recuperações preservadas.
                  </p>
                </div>
                <Button
                  className="primary-action"
                  onClick={() => setDetails(!details)}
                >
                  Detalhes do treino{' '}
                  {details ? <ChevronDown /> : <ChevronRight />}
                </Button>
                {details && (
                  <ol className="steps">
                    <li>10 min aquecimento progressivo</li>
                    <li>5 × 3 min a 305 W / 3 min leves</li>
                    <li>10 min desaquecimento</li>
                  </ol>
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
                Use a escala de 0 a 10. Dor forte ou sintomas sempre prevalecem
                sobre o relógio.
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
          <div className="trend-card">
            <p className="eyebrow">TENDÊNCIA DE 7 DIAS</p>
            <div className="bars">
              <i style={{ height: '58%' }} />
              <i style={{ height: '72%' }} />
              <i style={{ height: '82%' }} />
              <i style={{ height: '68%' }} />
              <i style={{ height: '43%' }} />
              <i style={{ height: '55%' }} />
              <i className="today" style={{ height: '38%' }} />
            </div>
            <div className="trend-labels">
              <span>26 ago.</span>
              <span>Hoje</span>
            </div>
          </div>
        </section>
      )}
      {tab === 'treinos' && (
        <section className="panel-stack">
          <div className="week-summary">
            <div>
              <p className="eyebrow">SEMANA 36</p>
              <h2>6h22 · Carga 429</h2>
            </div>
            <Badge variant="outline">Dentro do plano</Badge>
          </div>
          {[
            ['Hoje', 'VO₂ 5×3 a 305 W', '60 min · 76', 'yellow'],
            ['Quarta', 'Descanso', 'Recuperação', 'rest'],
            ['Quinta', 'Threshold 3×12', '1h16 · 88', 'green'],
            ['Sábado', 'Outdoor Endurance', '4h00 · 265', 'green'],
          ].map(([day, name, meta, color]) => (
            <Card className="day-card" key={day}>
              <div className={`day-dot ${color}`} />
              <div>
                <small>{day}</small>
                <strong>{name}</strong>
                <span>{meta}</span>
              </div>
              <ChevronRight />
            </Card>
          ))}
        </section>
      )}
      {installPrompt && (
        <button className="install-banner" onClick={install}>
          <Download size={18} />
          <span>
            <strong>Instalar Pedal Pronto</strong>
            <small>Use como app no celular, inclusive offline</small>
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
