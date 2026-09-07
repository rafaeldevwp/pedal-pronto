import { ensurePolarSchema, runtime } from '@/lib/polar';
export { assertDayAvailableForCreation, assertEditablePlannedEvent, proposalFingerprint } from '@/lib/training-safety-core';

export async function claimTrainingWrite(owner: string, operationId: string, proposalId: string) {
  await ensurePolarSchema();
  if (!operationId || !proposalId) throw new Error('CONSENT_REQUIRED');
  const insertion = await runtime.DB.prepare(
    'INSERT OR IGNORE INTO training_write_operations(operation_id,owner_id,proposal_id,status,created_at) VALUES(?,?,?,?,?)',
  ).bind(operationId, owner, proposalId, 'pending', Date.now()).run();
  if (insertion.meta.changes === 1) return { repeated: false as const };
  const claimed = await runtime.DB.prepare(
    'SELECT proposal_id,status,response_json FROM training_write_operations WHERE operation_id=? AND owner_id=?',
  ).bind(operationId, owner).first<{ proposal_id: string; status: string; response_json?: string }>();
  if (!claimed || claimed.proposal_id !== proposalId) throw new Error('CONSENT_REQUIRED');
  if (claimed.status === 'applied' && claimed.response_json)
    return { repeated: true, response: JSON.parse(claimed.response_json) };
  throw new Error('WRITE_IN_PROGRESS');
}

export async function completeTrainingWrite(owner: string, operationId: string, response: unknown) {
  await runtime.DB.prepare(
    "UPDATE training_write_operations SET status='applied',response_json=?,completed_at=? WHERE operation_id=? AND owner_id=? AND status='pending'",
  ).bind(JSON.stringify(response), Date.now(), operationId, owner).run();
}
