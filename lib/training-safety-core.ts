export type TrainingJson = {
  id?: string | number;
  category?: string;
  start_date_local?: string;
  start_date?: string;
  name?: string;
  description?: string;
  moving_time?: number;
  duration?: number;
  icu_training_load?: number;
  load?: number;
  completed?: boolean;
  paired_activity_id?: string | number;
  activity_id?: string | number;
  paired_event_id?: string | number;
  event_id?: string | number;
  icu_event_id?: string | number;
  [key: string]: unknown;
};

export function proposalFingerprint(event: TrainingJson, recommended: TrainingJson) {
  const source = JSON.stringify({
    id: event.id,
    date: String(event.start_date_local || event.start_date || '').slice(0, 10),
    name: event.name,
    description: event.description,
    duration: event.moving_time || event.duration,
    load: event.icu_training_load || event.load,
    recommended: {
      name: recommended.name,
      description: recommended.description,
      duration: recommended.moving_time || recommended.duration,
      load: recommended.icu_training_load || recommended.load,
    },
  });
  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `proposal-${event.id}-${(hash >>> 0).toString(16)}`;
}

export function assertEditablePlannedEvent(event: TrainingJson | undefined, activities: TrainingJson[], today: string) {
  if (!event || event.category !== 'WORKOUT') throw new Error('EVENT_NOT_EDITABLE');
  const eventDate = String(event.start_date_local || event.start_date || '').slice(0, 10);
  if (!eventDate || eventDate < today) throw new Error('EVENT_NOT_EDITABLE');
  if (event.completed || event.paired_activity_id || event.activity_id) throw new Error('WORKOUT_COMPLETED');
  const linked = activities.some((activity) => {
    const linkedEvent = activity.paired_event_id ?? activity.event_id ?? activity.icu_event_id;
    return linkedEvent !== undefined && Number(linkedEvent) === Number(event.id);
  });
  if (linked) throw new Error('WORKOUT_COMPLETED');
  if (eventDate === today && activities.length) throw new Error('WORKOUT_COMPLETED');
  return eventDate;
}

export function assertDayAvailableForCreation(events: TrainingJson[], activities: TrainingJson[]) {
  if (activities.length) throw new Error('WORKOUT_COMPLETED');
  if (events.length) throw new Error('EVENT_NOT_EDITABLE');
}
