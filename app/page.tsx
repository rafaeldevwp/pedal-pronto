'use client';
import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Bike,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  HeartPulse,
  Info,
  Link2,
  Moon,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
  Waves,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { checkinFields, defaultCheckin, parseStoredCheckin, type CheckinState } from '@/lib/checkin';
import { glossary, glossaryById, type GlossaryCategory } from '@/lib/glossary';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from 'recharts';

type Tab = 'hoje' | 'treinos' | 'evolucao' | 'glossario';
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
    original?: { name: string; durationMinutes?: number; load?: number; structure?: string[] };
  } | null;
  proposal?: {
    id: string;
    eventId: number;
    date: string;
    classification: 'amarela' | 'vermelha';
    change: string;
    original: { name: string; durationMinutes?: number; load?: number; structure?: string[] };
    recommended: { name: string; durationMinutes?: number; load?: number; structure?: string[] };
  };
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
    acwr?: number;
    rampLimit?: number;
    safetyFlags?: Array<{ id: 'acwr_high' | 'ramp_rate_exceeded'; severity: 'moderada' | 'severa' }>;
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
  comparison?: {
    headline: string;
    message: string;
    group: string;
    confidence: string;
    evidence: string[];
    caveat: string;
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
    id: string;
    name: string;
    durationMinutes: number;
    load: number;
    structure: string[];
    reason: string;
  };
  suggestionStatus?: string;
  forecast: {
    risk: 'baixo' | 'moderado' | 'alto' | 'indeterminado';
    headline: string;
    message: string;
    today: null | { name: string; load?: number; durationMinutes?: number };
    nextKey: null | { name: string; date: string; load?: number; durationMinutes?: number; daysAway?: number };
    evidence: string[];
    confidence: string;
    guidance: string;
    caveat: string;
  };
  futureAlert: null | {
    id: string;
    risk: 'moderado' | 'alto';
    title: string;
    message: string;
    eventId: number;
    workoutDate: string;
  };
  planOutlook: Array<{ id: number; date: string; name: string; status: 'protegido' | 'observar'; note: string }>;
  decisionHistory: Array<{
    id: number;
    decisionDate: string;
    workoutDate: string;
    source: 'prontidao_diaria' | 'replanejamento' | 'sugestao_off';
    status: 'mantido' | 'alterado' | 'adicionado';
    original: null | { name: string; durationMinutes?: number; load?: number };
    recommended: null | { name: string; durationMinutes?: number; load?: number };
    effective: null | { name: string; durationMinutes?: number; load?: number };
    reason: string;
    createdAt: string;
    outcome: null | { name: string; durationMinutes?: number; load?: number; rpe?: number };
  }>;
  proposal: null | {
    id: string;
    eventId: number;
    date: string;
    reason: string;
    change: string;
    weeklyLoadBefore: number;
    weeklyLoadAfter: number;
    original: { name: string; durationMinutes?: number; load?: number; structure: string[] };
    recommended: { name: string; durationMinutes?: number; load?: number; structure: string[] };
  };
  mesocycle: null | { cycle: number; week: number; day: number; phase: string };
  contextWarning?: string;
  weeklyLoadTarget: number;
  weeklyLoadDone: number;
  engineDecision: {
    action: 'manter' | 'reduzir_intensidade' | 'reduzir_repeticoes' | 'substituir_recuperacao' | 'suspender';
    stimulusPreserved: string;
    reasons: string[];
    recommended: null | { name: string; durationMinutes?: number; load?: number; descriptionChange?: string };
    weeklyEffect: string;
  };
};
type AthleteGoal = { objective: string; eventName: string; eventDate: string; priority: string; rampRateLimit: number };
type Mesocycle = { anchor: string | null; calculated: null | { cycle: number; week: number; day: number }; event: null | { cycle: number; week: number; day: number }; phase: string; warning: string | null };
type Performance = {
  updatedAt: string;
  activityCount: number;
  profile: string;
  profileMessage: string;
  warning?: string;
  power: Array<{ seconds: number; label: string; current?: number; previous?: number; change?: number }>;
  powerViews: Record<'season' | 'recent' | 'all', Array<{ seconds: number; label: string; current?: number; previous?: number; change?: number }>>;
  powerSource: string;
  cardio: Array<{ date: string; watts: number; heartRate: number; efficiency: number; decoupling?: number }>;
  efficiencyChange?: number;
  cardioHeadline: string;
  learning: {
    status: 'observado' | 'insuficiente';
    headline: string;
    message: string;
    sample: number;
    confidence: string;
    evidence: string[];
    caveat: string;
  };
};

function evolutionInsight(performance: Performance | null, result: Result | null, weeklySessions: number) {
  if (!performance || !result) return {
    key: 'insuficiente', title: 'Reunindo seus dados', text: 'Ainda estamos cruzando recuperação e histórico para produzir uma leitura confiável.',
    evidence: ['A análise será atualizada após a próxima sincronização.'], confidence: 'limitada',
  };
  const comparable = performance.powerViews?.season?.filter((point) => point.change !== undefined) || [];
  const powerChange = comparable.length ? comparable.reduce((sum, point) => sum + point.change!, 0) / comparable.length : undefined;
  const efficiency = performance.efficiencyChange;
  const positive = Number((powerChange || 0) > 2) + Number((efficiency || 0) > 3);
  const negative = Number((powerChange || 0) < -3) + Number((efficiency || 0) < -4);
  const evidence: string[] = [];
  if (powerChange !== undefined) evidence.push(`Potências da temporada ${powerChange >= 0 ? 'subiram' : 'caíram'} em média ${Math.abs(powerChange).toFixed(1)}%.`);
  if (efficiency !== undefined) evidence.push(efficiency >= 0 ? 'Você produz mais potência para esforço cardíaco semelhante.' : 'A relação entre potência e esforço cardíaco ficou menos favorável recentemente.');
  evidence.push(`${weeklySessions} ${weeklySessions === 1 ? 'treino realizado' : 'treinos realizados'} nesta semana; frequência isolada não define perda de forma.`);
  if (comparable.length < 3 || performance.activityCount < 4) return {
    key: 'insuficiente', title: 'Ainda não há evidência suficiente',
    text: 'Existem dados recentes, mas faltam sessões comparáveis para afirmar evolução ou regressão.', evidence, confidence: 'limitada',
  };
  if (negative >= 2) return {
    key: 'atencao', title: 'Há uma tendência que merece atenção',
    text: 'Potência e eficiência recuaram juntas. Vamos observar se isso persiste antes de chamar de regressão.', evidence, confidence: 'boa',
  };
  if (result.classification === 'vermelha' || result.classification === 'amarela') return {
    key: 'recuperando', title: 'Você parece estar absorvendo os treinos',
    text: 'A recuperação de hoje está abaixo do ideal, mas seu histórico não mostra perda consistente de capacidade.', evidence, confidence: positive ? 'boa' : 'moderada',
  };
  if (positive >= 2) return {
    key: 'evoluindo', title: 'Você está evoluindo',
    text: 'Potência e eficiência cardíaca avançaram juntas, com recuperação suficiente para sustentar a adaptação.', evidence, confidence: 'boa',
  };
  return {
    key: 'mantendo', title: 'Sua forma parece preservada',
    text: `Mesmo com ${weeklySessions} sessões nesta semana, não há sinais combinados de regressão. Seu corpo parece manter a capacidade atual.`, evidence, confidence: 'moderada',
  };
}

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

function TermHelp({ entryId, onOpen, light = false }: { entryId: string; onOpen: (id: string) => void; light?: boolean }) {
  const entry = glossaryById(entryId);
  if (!entry) return null;
  return (
    <Tooltip>
      <TooltipTrigger render={<button className={`info-trigger ${light ? 'light' : ''}`} aria-label={`Entenda ${entry.term}`} onClick={() => onOpen(entry.id)}><Info /></button>} />
      <TooltipContent side="bottom">{entry.summary} Toque para saber mais.</TooltipContent>
    </Tooltip>
  );
}

function RecoveryMetric({ label, value, entryId, onOpen }: { label: string; value: string; entryId: string; onOpen: (id: string) => void }) {
  return (
    <span>
      <small className="metric-label">
        {label}
        <TermHelp entryId={entryId} onOpen={onOpen} />
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
    [goal, setGoal] = useState<AthleteGoal>({ objective: 'performance', eventName: '', eventDate: '', priority: 'principal', rampRateLimit: 6 }),
    [goalSaved, setGoalSaved] = useState(false),
    [mesocycle, setMesocycle] = useState<Mesocycle | null>(null),
    [mesocycleAnchor, setMesocycleAnchor] = useState(''),
    [mesocycleSaved, setMesocycleSaved] = useState(false),
    [powerRange, setPowerRange] = useState<'season' | 'recent' | 'all'>('season'),
    [loading, setLoading] = useState(false),
    [creatingSuggestion, setCreatingSuggestion] = useState(false),
    [applyingProposal, setApplyingProposal] = useState(false),
    [dismissedAlert, setDismissedAlert] = useState(''),
    [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('unsupported'),
    [weekMessage, setWeekMessage] = useState(''),
    [glossarySearch, setGlossarySearch] = useState(''),
    [glossarySelected, setGlossarySelected] = useState(''),
    [checkin, setCheckin] = useState<CheckinState>({ ...defaultCheckin });
  useEffect(() => {
    if ('serviceWorker' in navigator)
      navigator.serviceWorker.register('/sw.js');
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const openFutureProposal = () => {
      if (window.location.hash === '#future-proposal') setTab('treinos');
    };
    openFutureProposal();
    window.addEventListener('hashchange', openFutureProposal);
    setCheckin(parseStoredCheckin(localStorage.getItem('pedal-pronto-checkin')));
    setDismissedAlert(localStorage.getItem('pedal-pronto-dismissed-alert') || '');
    if ('Notification' in window) setNotificationPermission(Notification.permission);
    fetch('/api/polar/status')
      .then((r) => (r.ok ? r.json() : { connected: false }))
      .then((r) => {
        setPolarConnected(r.connected);
        if (r.connected) {
          loadReadiness(false);
          loadWeek();
          loadPerformance();
          loadGoal();
          loadMesocycle();
        }
      })
      .catch(() => setPolarConnected(false));
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('hashchange', openFutureProposal);
    };
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
  useEffect(() => {
    const alert = week?.futureAlert;
    if (!alert || notificationPermission !== 'granted') return;
    if (localStorage.getItem('pedal-pronto-notified-alert') === alert.id) return;
    navigator.serviceWorker?.ready.then((registration) =>
      registration.showNotification(alert.title, {
        body: alert.message,
        icon: '/icon.svg',
        tag: alert.id,
        data: { url: '/#future-proposal' },
      }),
    ).then(() => localStorage.setItem('pedal-pronto-notified-alert', alert.id)).catch(() => {});
  }, [week?.futureAlert?.id, notificationPermission]);
  useEffect(() => {
    if (week?.proposal && window.location.hash === '#future-proposal')
      window.setTimeout(() => document.getElementById('future-proposal')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }, [week?.proposal?.eventId]);
  async function loadReadiness(withCheckin: boolean) {
    setLoading(true);
    try {
      const r = await fetch('/api/readiness', {
        method: withCheckin ? 'POST' : 'GET',
        headers: withCheckin ? { 'Content-Type': 'application/json' } : undefined,
        body: withCheckin ? JSON.stringify({ action: 'evaluate', checkin }) : undefined,
      });
      if (r.ok) {
        setResult(await r.json());
        if (withCheckin) loadWeek();
      }
    } finally {
      setLoading(false);
    }
  }
  async function confirmTodayProposal() {
    if (!result?.proposal || !window.confirm(`Confirmar a alteração de “${result.proposal.original.name}” no Intervals.icu?`)) return;
    setLoading(true);
    try {
      const response = await fetch('/api/readiness', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_today', confirmed: true, proposalId: result.proposal.id, operationId: crypto.randomUUID(), checkin }),
      });
      const body = await response.json();
      if (!response.ok) {
        const message = body.error === 'WORKOUT_COMPLETED' ? 'Treino já realizado — nenhuma alteração aplicada.'
          : body.error === 'PROPOSAL_CHANGED' ? 'O treino ou a proposta mudou. Atualize e revise novamente.'
            : 'Não foi possível aplicar a alteração.';
        setWeekMessage(message);
        await loadReadiness(true);
        return;
      }
      setWeekMessage(body.message);
      await loadReadiness(false);
      await loadWeek();
    } finally { setLoading(false); }
  }
  async function loadWeek() {
    const params = new URLSearchParams(checkin as unknown as Record<string, string>);
    const response = await fetch(`/api/week?${params.toString()}`);
    if (response.ok) setWeek(await response.json());
  }
  async function loadPerformance() {
    const response = await fetch('/api/performance');
    if (response.ok) setPerformance(await response.json());
  }
  async function loadGoal() {
    const response = await fetch('/api/profile');
    if (response.ok) setGoal(await response.json());
  }
  async function loadMesocycle() {
    const response = await fetch('/api/mesocycle');
    if (!response.ok) return;
    const value = await response.json() as Mesocycle;
    setMesocycle(value);
    setMesocycleAnchor(value.anchor || '');
  }
  async function saveMesocycle() {
    const response = await fetch('/api/mesocycle', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anchor: mesocycleAnchor }) });
    if (!response.ok) return;
    const value = await response.json() as Mesocycle;
    setMesocycle(value);
    setMesocycleSaved(true);
    setTimeout(() => setMesocycleSaved(false), 2200);
  }
  async function saveGoal() {
    const response = await fetch('/api/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(goal),
    });
    if (response.ok) {
      setGoal(await response.json());
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2200);
    }
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
      const response = await fetch('/api/week', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_suggestion', confirmed: true, proposalId: week.suggestion.id, operationId: crypto.randomUUID(), checkin }),
      });
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
  async function applyProposal() {
    if (!week?.proposal || !window.confirm(`Confirmar a alteração de “${week.proposal.original.name}” no Intervals.icu?`)) return;
    setApplyingProposal(true);
    setWeekMessage('');
    try {
      const response = await fetch('/api/week', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply_proposal', confirmed: true, proposalId: week.proposal.id, operationId: crypto.randomUUID(), eventId: week.proposal.eventId, checkin }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Não foi possível aplicar a proposta.');
      setWeek(body.week);
      setWeekMessage('Alteração confirmada e enviada ao Intervals.icu.');
    } catch (error) {
      setWeekMessage(error instanceof Error ? error.message : 'Falha ao alterar o treino.');
    } finally {
      setApplyingProposal(false);
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
  async function enableNotifications() {
    if (!('Notification' in window)) return;
    setNotificationPermission(await Notification.requestPermission());
  }
  function reviewFutureProposal() {
    setTab('treinos');
    window.setTimeout(() => document.getElementById('future-proposal')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }
  function dismissFutureAlert(id: string) {
    localStorage.setItem('pedal-pronto-dismissed-alert', id);
    setDismissedAlert(id);
  }
  function saveCheckin() {
    localStorage.setItem('pedal-pronto-checkin', JSON.stringify(checkin));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }
  function openGlossary(entryId: string) {
    const entry = glossaryById(entryId);
    setGlossarySearch(entry?.term || '');
    setGlossarySelected(entryId);
    setTab('glossario');
  }
  const status = result?.classification || 'indisponível';
  const recoveryCopy = status === 'verde'
    ? { title: 'Seu corpo está respondendo bem', action: 'Pode seguir o treino planejado. Não é necessário aumentar a sessão.' }
    : status === 'amarela'
      ? { title: 'Você recuperou apenas em parte', action: 'Comece com calma e reavalie as sensações durante o aquecimento.' }
      : status === 'vermelha'
        ? { title: 'Hoje o corpo pede recuperação', action: 'Priorize descanso ou atividade muito leve. Dor ou sintomas exigem cautela.' }
        : {
            title: result?.warning ? 'Dados incompletos' : 'Ainda não há dados suficientes',
            action: result?.warning || 'Sincronize o relógio antes de usar esta avaliação para decidir o treino.',
          };
  const simpleEvidence = (result?.evidence || []).map((item) =>
    item.startsWith('HRV') ? 'Sua recuperação interna ficou abaixo do seu padrão'
      : item.startsWith('FC noturna') ? 'Seu coração trabalhou mais que o habitual durante o repouso'
        : item.startsWith('Sono') ? 'Você dormiu menos que o seu habitual'
          : item.startsWith('Interrupções') ? 'Seu sono teve mais interrupções que o normal'
            : item.startsWith('Forma') ? 'Existe fadiga acumulada dos últimos treinos'
              : item.includes('dentro da tendência') ? 'Sono, recuperação e carga estão próximos do seu padrão'
                : item,
  );
  const activePower = performance?.powerViews?.[powerRange] || performance?.power || [];
  const dailyEvolution = evolutionInsight(performance, result, week?.events.filter((event) => event.status === 'realizado').length || 0);
  const metrics = [
    {
      icon: Moon,
      label: 'Sono',
      entryId: 'sono',
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
      entryId: 'hrv',
      value: result?.metrics.hrv ? `${Math.round(result.metrics.hrv)} ms` : '—',
      note:
        result?.metrics.ansCharge !== undefined
          ? `ANS ${result.metrics.ansCharge.toFixed(1)}`
          : 'Linha de base',
    },
    {
      icon: HeartPulse,
      label: 'FC noturna',
      entryId: 'fc-repouso',
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
              : tab === 'treinos'
                ? 'Sua semana'
                : tab === 'evolucao'
                  ? 'Sua evolução'
                  : 'Glossário'}
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
        <section className="connection-strip" aria-live="polite">
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
          <section id="panel-hoje" className={`readiness-card status-${status}`} aria-labelledby="readiness-title" aria-live="polite">
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
            {result?.warning && (
              <small className="data-warning">
                {result.warning}
                {result.warning.includes('expirou') && (
                  <> <a href="/api/polar/connect">Reconectar Polar</a>.</>
                )}
              </small>
            )}
            <div className="score-row">
              <div className="score-ring">
                <span>{result?.score ?? '—'}</span>
                <small>/ 5</small>
              </div>
              <div>
                <h2 id="readiness-title">{result?.title || 'Avaliando recuperação'}</h2>
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
                  <span className="metric-label">{m.label}<TermHelp entryId={m.entryId} onOpen={openGlossary} light /></span>
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
                    {result?.proposal ? 'Proposta pronta — confirmação necessária' : 'Plano protegido'}
                  </strong>
                  <span>
                    {result?.workout?.load
                      ? `Nova carga prevista ${result.workout.load}`
                      : 'Carga será preservada quando os dados forem insuficientes'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {result?.proposal && (
                  <div className="workout-comparison">
                    <div>
                      <small>ESTAVA PROGRAMADO</small>
                      <strong>{result.proposal.original.name}</strong>
                      <span>{result.proposal.original.durationMinutes ?? '—'} min · carga {result.proposal.original.load ?? '—'}</span>
                    </div>
                    <ChevronRight />
                    <div className="recommended-workout">
                      <small>RECOMENDADO</small>
                      <strong>{result.proposal.recommended.name}</strong>
                      <span>{result.proposal.recommended.durationMinutes ?? '—'} min · carga {result.proposal.recommended.load ?? '—'}</span>
                    </div>
                  </div>
                )}
                <div className="change-note">
                  <ShieldCheck size={18} />
                  <p>
                    <strong>
                      {result?.proposal ? 'Nada foi alterado sem sua confirmação' : 'Decisão conservadora'}
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
                    'Atualizar avaliação'
                  )}
                </Button>
                {result?.proposal && (
                  <Button className="primary-action" onClick={(event) => { event.stopPropagation(); confirmTodayProposal(); }} disabled={loading}>
                    Confirmar e enviar ao Intervals.icu
                  </Button>
                )}
                {weekMessage && <p className="action-message">{weekMessage}</p>}
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
      {tab === 'hoje' && polarConnected !== true && (
        <section aria-label="Recuperação e check-in de hoje">
          <details className="today-support">
            <summary>
              <span className="support-icon"><HeartPulse /></span>
              <span>
                <strong>Recuperação e check-in</strong>
                <small>{result ? `${recoveryCopy.title} · toque para ver detalhes` : 'Informe como você está'}</small>
              </span>
              <ChevronDown />
            </summary>
            <div className="support-content">
              {result && (
                <>
                  <p className="support-guidance"><strong>Orientação:</strong> {recoveryCopy.action}</p>
                  <p className="support-evidence">{simpleEvidence.slice(0, 2).join(' · ')}</p>
                  <TooltipProvider>
                    <div className="recovery-signals">
                      <RecoveryMetric label="Sono" value={result.metrics.sleepHours ? `${result.metrics.sleepHours} h` : '—'} entryId="sono" onOpen={openGlossary} />
                      <RecoveryMetric label="HRV" value={result.metrics.hrv ? `${Math.round(result.metrics.hrv)} ms` : '—'} entryId="hrv" onOpen={openGlossary} />
                      <RecoveryMetric label="FC repouso" value={result.metrics.restingHr ? `${Math.round(result.metrics.restingHr)} bpm` : '—'} entryId="fc-repouso" onOpen={openGlossary} />
                    </div>
                  </TooltipProvider>
                </>
              )}
              <div className="checkin-heading">
                <strong>Como você está agora?</strong>
                <small>Dor e sintomas prevalecem sobre o relógio.</small>
              </div>
              <div className="slider-list">
              {checkinFields.map((field) => (
                <div className="checkin-field" key={field.key}>
                  <span>
                    <span className="checkin-label" id={`checkin-${field.key}-label`}><strong>{field.label}</strong><small>{field.hint}</small></span>
                    <output aria-live="polite">{checkin[field.key]}{field.key === 'tempoDisponivel' ? ' min' : ''}</output>
                  </span>
                  <Slider
                    aria-labelledby={`checkin-${field.key}-label`}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={[checkin[field.key]]}
                    onValueChange={(value) => setCheckin((current) => ({
                      ...current,
                      [field.key]: Array.isArray(value) ? (value[0] ?? current[field.key]) : value,
                    }))}
                  />
                </div>
              ))}
              {(checkin.dor >= 6 || checkin.sintomas >= 5) && (
                <div className="checkin-alert">
                  <strong>Conduta conservadora ativada</strong>
                  <span>O app não recomendará intensificação. Dor persistente, sintomas ou piora merecem avaliação profissional.</span>
                </div>
              )}
              <Button className="primary-action" onClick={saveCheckin}>
                {saved ? (
                  <>
                    <Check /> Check-in salvo
                  </>
                ) : (
                  'Salvar check-in'
                )}
              </Button>
              </div>
            </div>
          </details>
          <p className="analysis-note">Tendências e histórico ficam na aba Evolução.</p>
        </section>
      )}
      {tab === 'treinos' && (
        <section id="panel-semana" className="panel-stack" aria-labelledby="week-title">
          <div className="week-summary">
            <div>
              <p className="eyebrow">SEMANA ATUAL</p>
              <h2 id="week-title">Treinos no Intervals.icu</h2>
              {week && (
                <span className="week-load-summary">
                  Carga realizada {week.weeklyLoadDone} de {week.weeklyLoadTarget} planejados
                </span>
              )}
            </div>
            <Badge variant="outline">{week?.events.length ?? 0} sessões</Badge>
          </div>
          {!week && (
            <p className="empty-insight">
              {loading
                ? 'Carregando o plano da semana…'
                : polarConnected === false
                  ? 'Conecte o Polar na aba Hoje para ver seus treinos da semana.'
                  : 'Não foi possível carregar a semana agora. Toque em sincronizar no topo da tela.'}
            </p>
          )}
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
                {workout.comparison && (
                  <div className="similar-comparison">
                    <small className="comparison-label">COMPARADO AO SEU HISTÓRICO</small>
                    <strong>{workout.comparison.headline}</strong>
                    <p>{workout.comparison.message}</p>
                    <span>{workout.comparison.group}</span>
                    {workout.comparison.evidence.length > 0 && (
                      <ul>{workout.comparison.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
                    )}
                    <small>Confiança {workout.comparison.confidence} · {workout.comparison.caveat}</small>
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
          {week?.futureAlert && dismissedAlert !== week.futureAlert.id && (
            <Card className={`future-alert risk-${week.futureAlert.risk}`} role="alert">
              <div className="future-alert-icon"><Bell /></div>
              <div className="future-alert-copy">
                <small>ALERTA DO PLANO</small>
                <h2>{week.futureAlert.title}</h2>
                <p>{week.futureAlert.message}</p>
                <div className="future-alert-actions">
                  <Button onClick={reviewFutureProposal}>Revisar proposta</Button>
                  {notificationPermission === 'default' && <Button variant="outline" onClick={enableNotifications}>Ativar no celular</Button>}
                  <Button variant="ghost" onClick={() => dismissFutureAlert(week.futureAlert!.id)}>Dispensar</Button>
                </div>
                <span>O alerta não altera o treino. A confirmação continua sendo sua.</span>
              </div>
            </Card>
          )}
          {week?.forecast && (
            <Card className={`forecast-card risk-${week.forecast.risk}`}>
              <div className="forecast-heading">
                <div>
                  <p className="eyebrow">IMPACTO NOS PRÓXIMOS DIAS</p>
                  <h2>{week.forecast.headline}</h2>
                </div>
                <Badge variant="outline">Risco {week.forecast.risk}</Badge>
              </div>
              <p className="muted-copy">{week.forecast.message}</p>
              {week.forecast.nextKey && (
                <div className="forecast-route">
                  <span><small>HOJE</small><strong>{week.forecast.today?.name || 'Recuperação'}</strong><em>{week.forecast.today?.load ? `Carga ${week.forecast.today.load}` : 'Sem carga planejada'}</em></span>
                  <ChevronRight />
                  <span><small>PRÓXIMO TREINO-CHAVE</small><strong>{week.forecast.nextKey.name}</strong><em>{formatDay(week.forecast.nextKey.date)} · {week.forecast.nextKey.load ? `carga ${week.forecast.nextKey.load}` : 'carga não informada'}</em></span>
                </div>
              )}
              <ul className="forecast-evidence">{week.forecast.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
              <div className="forecast-guidance"><ShieldCheck /><span><strong>Orientação</strong>{week.forecast.guidance}</span></div>
              <small className="forecast-caveat">Confiança {week.forecast.confidence} · {week.forecast.caveat}</small>
            </Card>
          )}
          {!week?.proposal && week?.contextWarning && (
            <Card className="context-warning-card">
              <div className="proposal-heading">
                <div>
                  <p className="eyebrow">DADOS CONTRADITÓRIOS</p>
                  <h2>Nenhuma proposta gerada</h2>
                </div>
              </div>
              <p className="muted-copy">{week.contextWarning}</p>
              <small className="proposal-footnote">Nada foi alterado. Assim que a divergência for resolvida, novas propostas voltam a ser avaliadas.</small>
            </Card>
          )}
          {week?.engineDecision && week.engineDecision.action !== 'manter' && week.engineDecision.action !== 'suspender' && (
            <Card className="engine-preview-card">
              <div className="proposal-heading">
                <div>
                  <p className="eyebrow">LEITURA DO MOTOR ADAPTATIVO · PRÉVIA</p>
                  <h2>{week.engineDecision.recommended?.name || 'Ajuste sugerido'}</h2>
                </div>
                <Badge variant="outline"><Sparkles /> Só leitura</Badge>
              </div>
              <ul className="forecast-evidence">{week.engineDecision.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              {week.engineDecision.recommended?.descriptionChange && (
                <div className="proposal-reason"><ShieldCheck /><span><strong>Estímulo preservado: {week.engineDecision.stimulusPreserved}</strong>{week.engineDecision.recommended.descriptionChange}</span></div>
              )}
              <small className="proposal-footnote">{week.engineDecision.weeklyEffect} Esta leitura ainda não escreve no Intervals.icu — é só uma prévia do motor adaptativo em desenvolvimento.</small>
            </Card>
          )}
          {week?.proposal && (
            <Card className="proposal-card" id="future-proposal">
              <div className="proposal-heading">
                <div>
                  <p className="eyebrow">PROPOSTA PARA {formatDay(week.proposal.date).toUpperCase()}</p>
                  <h2>Proteger o próximo estímulo</h2>
                </div>
                <Badge>Requer confirmação</Badge>
              </div>
              <p className="muted-copy">{week.proposal.reason}</p>
              <div className="proposal-comparison">
                <div>
                  <small>PROGRAMADO</small>
                  <strong>{week.proposal.original.name}</strong>
                  <span>{week.proposal.original.durationMinutes ?? '—'} min · carga {week.proposal.original.load ?? '—'}</span>
                </div>
                <ChevronRight />
                <div>
                  <small>RECOMENDADO</small>
                  <strong>{week.proposal.recommended.name}</strong>
                  <span>{week.proposal.recommended.durationMinutes ?? '—'} min · carga {week.proposal.recommended.load ?? '—'}</span>
                </div>
              </div>
              <div className="proposal-reason"><ShieldCheck /><span><strong>Mudança única</strong>{week.proposal.change}</span></div>
              <div className="weekly-impact">
                <span>Carga semanal</span>
                <strong>{week.proposal.weeklyLoadBefore} <ChevronRight /> {week.proposal.weeklyLoadAfter}</strong>
              </div>
              <Button className="primary-action" onClick={applyProposal} disabled={applyingProposal}>
                {applyingProposal ? <><RefreshCw className="spin" /> Aplicando…</> : 'Confirmar e enviar ao Intervals.icu'}
              </Button>
              <small className="proposal-footnote">Somente este treino será alterado. Atividades realizadas e os demais dias permanecem intactos.</small>
            </Card>
          )}
          {week?.planOutlook?.length > 0 && (
            <Card className="outlook-card">
              <p className="eyebrow">PRÓXIMOS DIAS</p>
              <h2>Plano vivo, sem mudanças silenciosas</h2>
              <p className="muted-copy">A carga atual já é considerada, mas qualquer alteração futura continuará apenas como proposta.</p>
              <div className="outlook-list">
                {week.planOutlook.map((item) => (
                  <div key={item.id}>
                    <span className={`outlook-state ${item.status}`} />
                    <span>
                      <small>{formatDay(item.date)} · {item.status === 'protegido' ? 'Plano protegido' : 'Em observação'}</small>
                      <strong>{item.name}</strong>
                      <em>{item.note}</em>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <Card className="decision-history-card">
            <div className="history-heading">
              <div>
                <p className="eyebrow">HISTÓRICO DE DECISÕES</p>
                <h2>O que foi decidido e o que aconteceu</h2>
              </div>
              <Badge variant="outline">Somente leitura</Badge>
            </div>
            {week?.decisionHistory?.length ? (
              <div className="decision-list">
                {week.decisionHistory.map((decision) => (
                  <details key={decision.id} className="decision-item">
                    <summary>
                      <span className={`decision-state ${decision.status}`} />
                      <span><small>{formatDay(decision.workoutDate)} · {decision.source === 'prontidao_diaria' ? 'Prontidão diária' : decision.source === 'replanejamento' ? 'Replanejamento confirmado' : 'Treino opcional'}</small><strong>{decision.effective?.name || decision.recommended?.name || decision.original?.name || 'Decisão registrada'}</strong></span>
                      <Badge variant="outline">{decision.status}</Badge>
                    </summary>
                    <div className="decision-flow">
                      <span><small>PROGRAMADO</small><strong>{decision.original?.name || 'Dia sem treino'}</strong><em>{decision.original?.durationMinutes ? `${decision.original.durationMinutes} min` : '—'} · carga {decision.original?.load ?? '—'}</em></span>
                      <ChevronRight />
                      <span><small>DECISÃO EFETIVA</small><strong>{decision.effective?.name || 'Sem alteração'}</strong><em>{decision.effective?.durationMinutes ? `${decision.effective.durationMinutes} min` : '—'} · carga {decision.effective?.load ?? '—'}</em></span>
                    </div>
                    <p>{decision.reason}</p>
                    {decision.outcome ? (
                      <div className="decision-outcome"><Check /><span><strong>Resultado posterior encontrado</strong>{decision.outcome.durationMinutes ?? '—'} min · carga {decision.outcome.load ?? '—'}{decision.outcome.rpe ? ` · sensação ${decision.outcome.rpe}/10` : ''}</span></div>
                    ) : (
                      <small className="history-pending">Resultado posterior ainda não disponível. O registro original permanece intacto.</small>
                    )}
                  </details>
                ))}
              </div>
            ) : (
              <p className="muted-copy">As próximas decisões manuais aparecerão aqui sem alterar registros anteriores.</p>
            )}
          </Card>
          {weekMessage && <p className="week-message">{weekMessage}</p>}
        </section>
      )}
      {tab === 'evolucao' && (
        <section id="panel-evolucao" className="panel-stack" aria-label="Evolução do atleta">
          <Card className={`daily-evolution ${dailyEvolution.key}`}>
            <div className="daily-evolution-heading">
              <span className="insight-icon"><Sparkles /></span>
              <div>
                <p className="eyebrow">LEITURA DIÁRIA DA EVOLUÇÃO</p>
                <h2>{dailyEvolution.title}</h2>
              </div>
              <Badge variant="outline">Confiança {dailyEvolution.confidence}</Badge>
            </div>
            <p className="insight-text">{dailyEvolution.text}</p>
            <div className="insight-evidence">
              {dailyEvolution.evidence.slice(0, 3).map((item, index) => <p key={index}>• {item}</p>)}
            </div>
            <details className="science-note">
              <summary>Como esta leitura é feita</summary>
              <p>Comparamos sua linha de base, prontidão do dia, potência da temporada, eficiência cardíaca e sessões semelhantes. Um treino isolado não determina regressão.</p>
              <span>Referências: estudos de treinamento orientado por HRV e variação diária do desempenho.</span>
            </details>
            <small className="insight-updated">Atualiza ao sincronizar o Polar ou concluir um treino no Intervals.icu.</small>
          </Card>
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
            <h2>{powerRange === 'season' ? 'Temporada atual × anterior' : powerRange === 'recent' ? 'Últimos 42 dias' : 'Melhores do histórico'}</h2>
            <div className="range-switch" role="group" aria-label="Período da curva de potência">
              <button className={powerRange === 'season' ? 'active' : ''} onClick={() => setPowerRange('season')}>Temporada</button>
              <button className={powerRange === 'recent' ? 'active' : ''} onClick={() => setPowerRange('recent')}>42 dias</button>
              <button className={powerRange === 'all' ? 'active' : ''} onClick={() => setPowerRange('all')}>Histórico</button>
            </div>
            <span className="data-source"><Link2 size={12} /> {performance?.powerSource || 'Dados do Intervals.icu'}</span>
            {activePower.some((point) => point.current) ? (
              <>
                <ChartContainer className="power-chart" config={{ current: { label: powerRange === 'season' ? 'Temporada atual' : powerRange === 'recent' ? 'Últimos 42 dias' : 'Melhor histórico', color: '#8b5cf0' }, previous: { label: 'Temporada anterior', color: '#c9c9d6' } }}>
                  <BarChart data={activePower} margin={{ left: -20, right: 4, top: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {powerRange === 'season' && <Bar dataKey="previous" fill="var(--color-previous)" radius={[5, 5, 0, 0]} />}
                    <Bar dataKey="current" fill="var(--color-current)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ChartContainer>
                <div className="power-list">
                  {activePower.map((point) => (
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
              <ChartContainer className="cardio-chart" config={{ watts: { label: 'Potência', color: '#8b5cf0' } }}>
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
          <Card className="learning-card">
            <div className="learning-heading">
              <div>
                <p className="eyebrow">SEU PADRÃO PESSOAL</p>
                <h2>{performance?.learning?.headline || 'Reunindo recuperação e treinos'}</h2>
              </div>
              <Badge variant="outline">{performance?.learning?.sample ?? 0} dias</Badge>
            </div>
            <p>{performance?.learning?.message || 'A análise aparecerá quando houver dados suficientes.'}</p>
            {performance?.learning?.evidence?.length ? (
              <ul>{performance.learning.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
            ) : null}
            {performance?.learning && (
              <small>Confiança {performance.learning.confidence} · {performance.learning.caveat}</small>
            )}
          </Card>
          <p className="analysis-note">Tendências comparam períodos, não diagnosticam saúde e não substituem sua percepção durante o treino.</p>
          <Card className="mesocycle-card">
            <div className="goal-heading">
              <div><p className="eyebrow">POSIÇÃO NO PLANO</p><h2>{mesocycle?.calculated ? `C${mesocycle.calculated.cycle} · W${mesocycle.calculated.week} · D${mesocycle.calculated.day}` : 'Mesociclo ainda não configurado'}</h2></div>
              <Badge variant="outline">Fase: {mesocycle?.phase || 'desconhecida'}</Badge>
            </div>
            <p className="anchor-highlight"><strong>Âncora atual:</strong> {mesocycle?.anchor ? new Date(`${mesocycle.anchor}T12:00:00`).toLocaleDateString('pt-BR') : 'não definida'}</p>
            {mesocycle?.warning && <small className="data-warning">{mesocycle.warning}</small>}
            <div className="mesocycle-form">
              <label>Início de C1W1D1<input type="date" value={mesocycleAnchor} onChange={(event) => setMesocycleAnchor(event.target.value)} /></label>
            </div>
            <Button className="primary-action" disabled={!mesocycleAnchor} onClick={saveMesocycle}>{mesocycleSaved ? <><Check /> Mesociclo salvo</> : 'Salvar posição do plano'}</Button>
            <small className="analysis-note">A fase (semanas 1-3 build, semana 4 recovery) é calculada automaticamente a partir da âncora e decide qual variável do treino cede primeiro quando a prontidão pede cautela.</small>
          </Card>
          <Card className="goal-card">
            <div className="goal-heading">
              <div>
                <p className="eyebrow">DIREÇÃO DA TEMPORADA</p>
                <h2>Onde você quer chegar?</h2>
              </div>
              <Badge variant="outline">Guia do plano</Badge>
            </div>
            <p className="muted-copy">Contexto da sua temporada. A prontidão e a fase do mesociclo decidem o treino do dia — este objetivo não altera nenhuma decisão.</p>
            <div className="goal-form">
              <label>Objetivo
                <select value={goal.objective} onChange={(event) => setGoal({ ...goal, objective: event.target.value })}>
                  <option value="performance">Melhorar performance geral</option>
                  <option value="resistencia">Ganhar resistência</option>
                  <option value="ftp">Evoluir potência/FTP</option>
                  <option value="saude">Saúde e consistência</option>
                </select>
              </label>
              <label>Evento ou marco
                <input value={goal.eventName} placeholder="Ex.: Gran Fondo" onChange={(event) => setGoal({ ...goal, eventName: event.target.value })} />
              </label>
              <div className="goal-row">
                <label>Data
                  <input type="date" value={goal.eventDate} onChange={(event) => setGoal({ ...goal, eventDate: event.target.value })} />
                </label>
                <label>Prioridade
                  <select value={goal.priority} onChange={(event) => setGoal({ ...goal, priority: event.target.value })}>
                    <option value="principal">Principal</option>
                    <option value="secundario">Secundário</option>
                    <option value="base">Construção de base</option>
                  </select>
                </label>
              </div>
              <label>Teto semanal de rampa do CTL
                <input type="number" min="1" max="15" step="0.5" value={goal.rampRateLimit} onChange={(event) => setGoal({ ...goal, rampRateLimit: Number(event.target.value) })} />
              </label>
            </div>
            <Button className="primary-action" onClick={saveGoal}>{goalSaved ? <><Check /> Objetivo salvo</> : 'Salvar direção da temporada'}</Button>
          </Card>
        </section>
      )}
      {tab === 'glossario' && (
        <section id="panel-glossario" className="panel-stack glossary-page" aria-label="Glossário de termos">
          <Card className="glossary-intro">
            <p className="eyebrow">ENTENDA SEUS DADOS</p>
            <h2>Termos técnicos em linguagem simples</h2>
            <p className="muted-copy">Nenhuma métrica isolada define sua saúde ou decide um treino. O app compara principalmente com seu próprio padrão.</p>
            <label className="glossary-search">
              <Search aria-hidden="true" />
              <span className="sr-only">Buscar no glossário</span>
              <input value={glossarySearch} onChange={(event) => { setGlossarySelected(''); setGlossarySearch(event.target.value); }} placeholder="Buscar HRV, carga, desacoplamento…" />
            </label>
          </Card>
          {(['Recuperação', 'Carga', 'Treino', 'Planejamento'] as GlossaryCategory[]).map((category) => {
            const query = glossarySearch.trim().toLocaleLowerCase('pt-BR');
            const entries = glossary.filter((entry) => entry.category === category && (glossarySelected ? entry.id === glossarySelected : !query || [entry.term, entry.fullName, entry.summary].some((text) => text.toLocaleLowerCase('pt-BR').includes(query))));
            if (!entries.length) return null;
            return (
              <section className="glossary-group" key={category} aria-labelledby={`glossary-${category}`}>
                <h2 id={`glossary-${category}`}>{category}</h2>
                {entries.map((entry) => (
                  <details className="glossary-entry" key={entry.id} open={query.length > 0 || entry.id === glossarySelected}>
                    <summary>
                      <span><strong>{entry.term}</strong><small>{entry.fullName}{entry.unit ? ` · ${entry.unit}` : ''}</small></span>
                      <ChevronDown aria-hidden="true" />
                    </summary>
                    <div className="glossary-body">
                      <p>{entry.summary}</p>
                      <dl>
                        <div><dt>Como usamos</dt><dd>{entry.appUse}</dd></div>
                        <div><dt>Como interpretar</dt><dd>{entry.direction}</dd></div>
                        <div><dt>Seu padrão</dt><dd>{entry.baseline}</dd></div>
                        <div><dt>Fonte</dt><dd>{entry.source}{entry.unit ? ` · unidade ${entry.unit}` : ' · sem unidade única'}</dd></div>
                        <div><dt>Limites</dt><dd>{entry.limitations}</dd></div>
                      </dl>
                      {entry.related?.length ? <p className="related-terms">Relacionado: {entry.related.map((id) => glossaryById(id)?.term).filter(Boolean).join(' · ')}</p> : null}
                    </div>
                  </details>
                ))}
              </section>
            );
          })}
          {glossarySearch && !glossarySelected && !glossary.some((entry) => [entry.term, entry.fullName, entry.summary].some((text) => text.toLocaleLowerCase('pt-BR').includes(glossarySearch.toLocaleLowerCase('pt-BR')))) && (
            <Card className="empty-insight">Nenhum termo encontrado. Tente uma sigla ou palavra mais curta.</Card>
          )}
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
          aria-current={tab === 'hoje' ? 'page' : undefined}
          aria-controls="panel-hoje"
        >
          <Activity />
          <span>Hoje</span>
        </button>
        <button
          className={tab === 'treinos' ? 'active' : ''}
          onClick={() => setTab('treinos')}
          aria-current={tab === 'treinos' ? 'page' : undefined}
          aria-controls="panel-semana"
        >
          <Bike />
          <span>Semana</span>
        </button>
        <button
          className={tab === 'evolucao' ? 'active' : ''}
          onClick={() => setTab('evolucao')}
          aria-current={tab === 'evolucao' ? 'page' : undefined}
          aria-controls="panel-evolucao"
        >
          <TrendingUp />
          <span>Evolução</span>
        </button>
        <button
          className={tab === 'glossario' ? 'active' : ''}
          onClick={() => { setGlossarySearch(''); setGlossarySelected(''); setTab('glossario'); }}
          aria-current={tab === 'glossario' ? 'page' : undefined}
          aria-controls="panel-glossario"
        >
          <BookOpen />
          <span>Glossário</span>
        </button>
      </nav>
    </main>
  );
}
