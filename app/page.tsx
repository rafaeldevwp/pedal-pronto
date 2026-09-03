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
  Info,
  Link2,
  Moon,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Zap,
  Waves,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

type Tab = 'hoje' | 'recuperacao' | 'treinos' | 'evolucao';
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
  loadTrend: Array<{ date: string; fitness?: number; fatigue?: number }>;
  workout: {
    name: string;
    durationMinutes?: number;
    load?: number;
    action: string;
    structure?: string[];
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
type WeekWorkout = {
  id: number;
  date: string;
  name: string;
  durationMinutes?: number;
  load?: number;
  structure: string[];
  status: 'planejado' | 'realizado';
  feedback?: {
    headline: string;
    message: string;
    nextStep: string;
    confidence: string;
    signals: string[];
  };
  details?: {
    power?: number;
    heartRate?: number;
    cadence?: number;
    rpe?: number;
    intensity?: number;
    decoupling?: number;
    efficiency?: number;
  };
};
type Week = {
  today: string;
  monday: string;
  sunday: string;
  events: WeekWorkout[];
  suggestion: null | {
    name: string;
    durationMinutes: number;
    load: number;
    structure: string[];
    reason: string;
  };
  suggestionStatus?: string;
};
type Performance = {
  updatedAt: string;
  activityCount: number;
  profile: string;
  profileMessage: string;
  warning?: string;
  power: Array<{ seconds: number; label: string; current?: number; previous?: number; change?: number }>;
  cardio: Array<{ date: string; watts: number; heartRate: number; efficiency: number; decoupling?: number }>;
  efficiencyChange?: number;
  cardioHeadline: string;
};

function WorkoutBlocks({ steps }: { steps: string[] }) {
  const blocks = steps.map((step, index) => {
    const repetition = step.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*([hms])/i);
    const duration = step.match(/(\d+(?:\.\d+)?)\s*([hms])/i);
    const amount = Number(repetition?.[2] || duration?.[1] || 1);
    const unit = repetition?.[3] || duration?.[2] || 'm';
    const multiplier = unit.toLowerCase() === 'h' ? 60 : unit.toLowerCase() === 's' ? 1 / 60 : 1;
    const repeat = Number(repetition?.[1] || 1);
    const intensity = Number(step.match(/(\d+)\s*%/)?.[1] || 50);
    return { step, minutes: Math.max(1, amount * multiplier * repeat), intensity, index };
  });
  const total = blocks.reduce((sum, block) => sum + block.minutes, 0) || 1;
  return (
    <div className="block-chart" aria-label="Gráfico dos blocos do treino">
      {blocks.map((block) => (
        <div
          className={`block-segment intensity-${block.intensity >= 95 ? 'high' : block.intensity >= 70 ? 'mid' : 'low'}`}
          key={`${block.index}-${block.step}`}
          style={{ flexGrow: Math.max(8, (block.minutes / total) * 100) }}
          title={block.step.replace(/^[-*]\s*/, '')}
        >
          <span>{block.minutes >= 5 ? `${Math.round(block.minutes)}m` : ''}</span>
        </div>
      ))}
    </div>
  );
}

function RecoveryMetric({ label, value, explanation }: { label: string; value: string; explanation: string }) {
  return (
    <span>
      <small className="metric-label">
        {label}
        <Tooltip>
          <TooltipTrigger render={<button className="info-trigger" aria-label={`O que significa ${label}`}><Info /></button>} />
          <TooltipContent side="bottom">{explanation}</TooltipContent>
        </Tooltip>
      </small>
      <strong>{value}</strong>
    </span>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('hoje'),
    [details, setDetails] = useState(false),
    [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null),
    [saved, setSaved] = useState(false),
    [polarConnected, setPolarConnected] = useState<boolean | null>(null),
    [result, setResult] = useState<Result | null>(null),
    [week, setWeek] = useState<Week | null>(null),
    [performance, setPerformance] = useState<Performance | null>(null),
    [loading, setLoading] = useState(false),
    [creatingSuggestion, setCreatingSuggestion] = useState(false),
    [weekMessage, setWeekMessage] = useState(''),
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
        if (r.connected) {
          loadReadiness(false);
          loadWeek();
          loadPerformance();
        }
      })
      .catch(() => setPolarConnected(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  useEffect(() => {
    const refreshAfterSync = () => {
      if (document.visibilityState === 'visible' && polarConnected) {
        loadReadiness(false);
        loadWeek();
        loadPerformance();
      }
    };
    document.addEventListener('visibilitychange', refreshAfterSync);
    const timer = window.setInterval(refreshAfterSync, 3 * 60 * 1000);
    return () => {
      document.removeEventListener('visibilitychange', refreshAfterSync);
      window.clearInterval(timer);
    };
  }, [polarConnected]);
  async function loadReadiness(apply: boolean) {
    setLoading(true);
    try {
      const r = await fetch('/api/readiness', {
        method: apply ? 'POST' : 'GET',
        headers: apply ? { 'Content-Type': 'application/json' } : undefined,
        body: apply ? JSON.stringify({ checkin }) : undefined,
      });
      if (r.ok) {
        setResult(await r.json());
        if (apply) loadWeek();
      }
    } finally {
      setLoading(false);
    }
  }
  async function loadWeek() {
    const response = await fetch('/api/week');
    if (response.ok) setWeek(await response.json());
  }
  async function loadPerformance() {
    const response = await fetch('/api/performance');
    if (response.ok) setPerformance(await response.json());
  }
  async function createSuggestion() {
    if (
      !week?.suggestion ||
      !window.confirm(
        `Adicionar “${week.suggestion.name}” ao Intervals.icu hoje?`,
      )
    )
      return;
    setCreatingSuggestion(true);
    setWeekMessage('');
    try {
      const response = await fetch('/api/week', { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Não foi possível criar.');
      setWeek(body.week);
      setWeekMessage('Treino adicionado ao Intervals.icu.');
      await loadReadiness(false);
    } catch (error) {
      setWeekMessage(error instanceof Error ? error.message : 'Falha ao criar treino.');
    } finally {
      setCreatingSuggestion(false);
    }
  }
  const formatDay = (date: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(`${date}T12:00:00Z`));
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
  const recoveryCopy = status === 'verde'
    ? { title: 'Seu corpo está respondendo bem', action: 'Pode seguir o treino planejado. Não é necessário aumentar a sessão.' }
    : status === 'amarela'
      ? { title: 'Você recuperou apenas em parte', action: 'Comece com calma e reavalie as sensações durante o aquecimento.' }
      : status === 'vermelha'
        ? { title: 'Hoje o corpo pede recuperação', action: 'Priorize descanso ou atividade muito leve. Dor ou sintomas exigem cautela.' }
        : { title: 'Ainda não há dados suficientes', action: 'Sincronize o relógio antes de usar esta avaliação para decidir o treino.' };
  const simpleEvidence = (result?.evidence || []).map((item) =>
    item.startsWith('HRV') ? 'Sua recuperação interna ficou abaixo do seu padrão'
      : item.startsWith('FC noturna') ? 'Seu coração trabalhou mais que o habitual durante o repouso'
        : item.startsWith('Sono') ? 'Você dormiu menos que o seu habitual'
          : item.startsWith('Interrupções') ? 'Seu sono teve mais interrupções que o normal'
            : item.startsWith('Forma') ? 'Existe fadiga acumulada dos últimos treinos'
              : item.includes('dentro da tendência') ? 'Sono, recuperação e carga estão próximos do seu padrão'
                : item,
  );
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
                : tab === 'treinos'
                  ? 'Plano de treinos'
                  : 'Sua evolução'}
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
            onClick={() => { loadReadiness(false); loadWeek(); loadPerformance(); }}
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
            <Card
              className="workout-card"
              onClick={() => setDetails(!details)}
              role="button"
              tabIndex={0}
            >
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
                  onClick={(event) => {
                    event.stopPropagation();
                    loadReadiness(true);
                  }}
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
                  onClick={(event) => {
                    event.stopPropagation();
                    setDetails(!details);
                  }}
                >
                  Dados que sustentam a decisão{' '}
                  {details ? <ChevronDown /> : <ChevronRight />}
                </Button>
                {details && (
                  <div className="steps">
                    {result?.workout?.structure?.length ? (
                      <>
                        <strong>Estrutura do treino</strong>
                        <WorkoutBlocks steps={result.workout.structure} />
                        {result.workout.structure.map((step, i) => (
                          <p key={`step-${i}`}>{step}</p>
                        ))}
                      </>
                    ) : (
                      <p>
                        Estrutura detalhada não disponível para este treino.
                      </p>
                    )}
                    <strong>Dados da decisão</strong>
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
          {result && (
            <Card className={`recovery-overview status-${status}`}>
              <div className="recovery-title">
                <div>
                  <p className="eyebrow">RECUPERAÇÃO DE HOJE</p>
                  <h2>{recoveryCopy.title}</h2>
                </div>
                <Badge className="status-badge">{status.toUpperCase()}</Badge>
              </div>
              <p className="recovery-action"><strong>O que fazer:</strong> {recoveryCopy.action}</p>
              <div className="recovery-why">
                <small>O que mais pesou nesta leitura</small>
                <p>{simpleEvidence.slice(0, 2).join(' · ')}</p>
              </div>
              <TooltipProvider>
                <div className="recovery-signals">
                  <RecoveryMetric label="Sono" value={result.metrics.sleepHours ? `${result.metrics.sleepHours} h` : '—'} explanation="Tempo total dormido. O aplicativo compara esta noite principalmente com o seu próprio padrão." />
                  <RecoveryMetric label="HRV" value={result.metrics.hrv ? `${Math.round(result.metrics.hrv)} ms` : '—'} explanation="Variação entre os batimentos. Mudanças persistentes em relação ao seu padrão ajudam a indicar recuperação ou estresse." />
                  <RecoveryMetric label="FC repouso" value={result.metrics.restingHr ? `${Math.round(result.metrics.restingHr)} bpm` : '—'} explanation="Batimentos durante o repouso noturno. Um aumento fora do habitual pode acompanhar fadiga, estresse ou recuperação incompleta." />
                </div>
              </TooltipProvider>
              <Button variant="outline" className="recovery-refresh" onClick={() => { loadReadiness(false); loadWeek(); loadPerformance(); }} disabled={loading}>
                <RefreshCw className={loading ? 'spin' : ''} /> Atualizar após sincronizar
              </Button>
            </Card>
          )}
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
              <p className="eyebrow">EVOLUÇÃO DOS ÚLTIMOS 7 DIAS</p>
              <h2>Carga crônica e fadiga</h2>
              {result.loadTrend.length ? (
                <ChartContainer
                  className="load-chart"
                  config={{ fitness: { label: 'Carga crônica', color: '#165c45' }, fatigue: { label: 'Fadiga', color: '#edc961' } }}
                >
                  <AreaChart data={result.loadTrend} margin={{ left: 0, right: 4, top: 10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(value) => value.slice(8, 10)} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="fatigue" stroke="var(--color-fatigue)" fill="var(--color-fatigue)" fillOpacity={0.13} />
                    <Area type="monotone" dataKey="fitness" stroke="var(--color-fitness)" fill="var(--color-fitness)" fillOpacity={0.2} />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <p className="muted-copy">Aguardando histórico suficiente do Intervals.icu.</p>
              )}
              <div className="chart-legend">
                <span><i className="fitness" />Carga crônica {result.metrics.ctl?.toFixed(0) ?? '—'}</span>
                <span><i className="fatigue" />Fadiga {result.metrics.atl?.toFixed(0) ?? '—'}</span>
              </div>
            </div>
          )}
        </section>
      )}
      {tab === 'treinos' && (
        <section className="panel-stack">
          <div className="week-summary">
            <div>
              <p className="eyebrow">SEMANA ATUAL</p>
              <h2>Treinos no Intervals.icu</h2>
            </div>
            <Badge variant="outline">{week?.events.length ?? 0} sessões</Badge>
          </div>
          <div className="week-list">
            {week?.events.map((workout) => (
              <details className={`week-workout ${workout.status}`} key={`${workout.status}-${workout.id}`}>
                <summary>
                  <span className={`day-dot ${workout.status === 'realizado' ? 'done' : 'green'}`} />
                  <span className="week-workout-title">
                    <small>
                      {formatDay(workout.date)} · {workout.status === 'realizado' ? 'Realizado' : 'Planejado'}
                    </small>
                    <strong>{workout.name}</strong>
                    <span>
                      {workout.durationMinutes ? `${workout.durationMinutes} min` : 'Duração —'}
                      {workout.load ? ` · Carga ${workout.load}` : ''}
                    </span>
                  </span>
                  <ChevronDown size={18} />
                </summary>
                {workout.feedback && (
                  <div className="simple-feedback">
                    <strong>{workout.feedback.headline}</strong>
                    <p>{workout.feedback.message}</p>
                    <small>{workout.feedback.nextStep}</small>
                    <small className="confidence-note">
                      Confiança {workout.feedback.confidence} · {workout.feedback.signals.length} sinais combinados
                    </small>
                  </div>
                )}
                {workout.structure.length ? (
                  <div className="workout-expanded">
                    <WorkoutBlocks steps={workout.structure} />
                    <ol className="workout-structure">
                      {workout.structure.map((step, index) => (
                        <li key={index}>
                          <b>{index + 1}</b>
                          <span>{step.replace(/^[-*]\s*/, '')}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  !workout.feedback && (
                    <p className="muted-copy">Estrutura em blocos não informada neste treino.</p>
                  )
                )}
                {workout.status === 'realizado' && workout.details && (
                  <div className="training-details">
                    <small>Detalhes do Intervals</small>
                    <span>
                      {workout.details.power ? `Potência ${Math.round(workout.details.power)} W` : ''}
                      {workout.details.heartRate ? ` · FC ${Math.round(workout.details.heartRate)} bpm` : ''}
                      {workout.details.cadence ? ` · Cadência ${Math.round(workout.details.cadence)} rpm` : ''}
                      {workout.details.rpe ? ` · Sensação ${workout.details.rpe}/10` : ''}
                      {workout.details.intensity ? ` · Intensidade ${Math.round(workout.details.intensity * 100)}%` : ''}
                      {workout.details.decoupling ? ` · Variação cardíaca ${workout.details.decoupling.toFixed(1)}%` : ''}
                    </span>
                  </div>
                )}
              </details>
            ))}
            {week && !week.events.length && (
              <Card className="structure-card">
                <p className="muted-copy">Nenhum treino encontrado nesta semana.</p>
              </Card>
            )}
          </div>
          {week?.suggestion ? (
            <Card className="suggestion-card">
              <div className="suggestion-heading">
                <div>
                  <p className="eyebrow">OPÇÃO PARA O DESCANSO</p>
                  <h2>{week.suggestion.name}</h2>
                </div>
                <Badge variant="outline">Opcional</Badge>
              </div>
              <p className="muted-copy">{week.suggestion.reason}</p>
              <WorkoutBlocks steps={week.suggestion.structure} />
              <ol className="workout-structure">
                {week.suggestion.structure.map((step, index) => (
                  <li key={index}>
                    <b>{index + 1}</b>
                    <span>{step.replace(/^[-*]\s*/, '')}</span>
                  </li>
                ))}
              </ol>
              <p className="suggestion-meta">
                {week.suggestion.durationMinutes} min · Carga prevista {week.suggestion.load}
              </p>
              <Button className="primary-action" onClick={createSuggestion} disabled={creatingSuggestion}>
                {creatingSuggestion ? <RefreshCw className="spin" /> : <Bike />}
                Fazer este treino
              </Button>
            </Card>
          ) : week?.suggestionStatus ? (
            <p className="suggestion-status">{week.suggestionStatus}</p>
          ) : null}
          {weekMessage && <p className="week-message">{weekMessage}</p>}
        </section>
      )}
      {tab === 'evolucao' && (
        <section className="panel-stack">
          <Card className="profile-card">
            <div className="profile-icon"><TrendingUp /></div>
            <div>
              <p className="eyebrow">SEU PERFIL NOS ÚLTIMOS 42 DIAS</p>
              <h2>{performance?.profile || 'Analisando seu histórico'}</h2>
              <p className="muted-copy">{performance?.profileMessage || 'Comparando com os 42 dias anteriores.'}</p>
              <span className="data-source"><Link2 size={12} /> Dados do Intervals.icu</span>
              {performance?.warning && <small className="data-warning">{performance.warning}</small>}
            </div>
          </Card>
          <Card className="performance-card">
            <p className="eyebrow">MELHORES POTÊNCIAS</p>
            <h2>Onde você está evoluindo</h2>
            {performance?.power.some((point) => point.current) ? (
              <>
                <ChartContainer className="power-chart" config={{ current: { label: 'Últimos 42 dias', color: '#165c45' }, previous: { label: '42 dias anteriores', color: '#b9c6bd' } }}>
                  <BarChart data={performance.power} margin={{ left: -20, right: 4, top: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="previous" fill="var(--color-previous)" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="current" fill="var(--color-current)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ChartContainer>
                <div className="power-list">
                  {performance.power.map((point) => (
                    <span key={point.seconds}>
                      <small>{point.label}</small>
                      <strong>{point.current ? `${Math.round(point.current)} W` : '—'}</strong>
                      <em className={(point.change || 0) >= 0 ? 'up' : 'down'}>
                        {point.change !== undefined ? `${point.change >= 0 ? '+' : ''}${point.change.toFixed(1)}%` : 'sem comparação'}
                      </em>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-insight">O Intervals ainda não devolveu potências máximas suficientes para montar sua curva.</p>
            )}
          </Card>
          <Card className="performance-card">
            <p className="eyebrow">CORAÇÃO × POTÊNCIA</p>
            <h2>{performance?.cardioHeadline || 'Analisando eficiência'}</h2>
            <p className="muted-copy">
              Cada ponto é um treino: mais alto e mais à esquerda significa mais potência com menor esforço cardíaco.
            </p>
            {performance && performance.cardio.length >= 2 ? (
              <ChartContainer className="cardio-chart" config={{ watts: { label: 'Potência', color: '#165c45' } }}>
                <ScatterChart margin={{ left: -12, right: 8, top: 12, bottom: 4 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="heartRate" name="Frequência cardíaca" unit=" bpm" tickLine={false} />
                  <YAxis type="number" dataKey="watts" name="Potência" unit=" W" tickLine={false} />
                  <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                  <Scatter data={performance.cardio} fill="var(--color-watts)" />
                </ScatterChart>
              </ChartContainer>
            ) : (
              <p className="empty-insight">Precisamos de ao menos dois pedais com potência e frequência cardíaca.</p>
            )}
            {performance?.efficiencyChange !== undefined && (
              <div className="efficiency-note">
                <Zap size={17} />
                <span><strong>{performance.efficiencyChange >= 0 ? '+' : ''}{performance.efficiencyChange.toFixed(1)}%</strong> de mudança na relação potência–coração dentro do período.</span>
              </div>
            )}
          </Card>
          <p className="analysis-note">Tendências comparam períodos, não diagnosticam saúde e não substituem sua percepção durante o treino.</p>
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
        <button
          className={tab === 'evolucao' ? 'active' : ''}
          onClick={() => setTab('evolucao')}
        >
          <TrendingUp />
          <span>Evolução</span>
        </button>
      </nav>
    </main>
  );
}
