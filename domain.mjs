import { randomUUID } from 'node:crypto';

const transitions = {
  scan: { role: 'disclosure_analyst', from: 'submitted', to: 'scanned', field: 'disclosureScanReference' },
  review: { role: 'data_steward', from: 'scanned', to: 'reviewed', field: 'suppressionPlanReference' },
  approve: { role: 'privacy_authority', from: 'reviewed', to: 'approved', field: 'approvalReference' },
  certify: { role: 'release_certifier', from: 'approved', to: 'certified', field: 'releaseCertificateReference' }
};

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
  return value.trim();
}

function requiredPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) throw new Error(`${label} must be a positive integer`);
  return value;
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }

export class CellSuppressionControlService {
  constructor(store, clock = () => new Date().toISOString()) { this.store = store; this.clock = clock; }

  list() { return this.store.read().cases.map(clone); }

  submit(input, actor) {
    if (actor?.role !== 'evidence_owner') throw new Error('actor role evidence_owner is required');
    const occurredAt = this.clock();
    const caseRecord = {
      id: randomUUID(),
      supplier: requiredText(input?.supplier, 'supplier'),
      evidenceReference: requiredText(input?.evidenceReference, 'evidence reference'),
      tablePurpose: requiredText(input?.tablePurpose, 'table purpose'),
      minimumCellCount: requiredPositiveInteger(input?.minimumCellCount, 'minimum cell count'),
      status: 'submitted',
      createdAt: occurredAt,
      updatedAt: occurredAt,
      auditEvents: [{ type: 'cell_suppression_submitted', actorId: requiredText(actor.id, 'actor id'), occurredAt }]
    };
    const document = this.store.read();
    document.cases.push(caseRecord);
    this.store.write(document);
    return clone(caseRecord);
  }

  transition(id, action, input, actor) {
    const rule = transitions[action];
    if (!rule) throw new Error('unsupported cell-suppression action');
    if (actor?.role !== rule.role) throw new Error(`actor role ${rule.role} is required`);
    const document = this.store.read();
    const caseRecord = document.cases.find((entry) => entry.id === id);
    if (!caseRecord) throw new Error('cell-suppression case not found');
    if (caseRecord.status !== rule.from) throw new Error(`cannot ${action} a case in ${caseRecord.status} status`);
    const occurredAt = this.clock();
    caseRecord.status = rule.to;
    caseRecord.updatedAt = occurredAt;
    caseRecord[rule.field] = requiredText(input?.[rule.field], rule.field);
    caseRecord.auditEvents.push({ type: `cell_suppression_${rule.to}`, actorId: requiredText(actor.id, 'actor id'), occurredAt });
    this.store.write(document);
    return clone(caseRecord);
  }
}
