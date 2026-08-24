import { describe, expect, it } from 'vitest';
import { CellSuppressionControlService } from '../domain.mjs';

function memoryStore() {
  let document = { cases: [] };
  return { read: () => JSON.parse(JSON.stringify(document)), write: (next) => { document = JSON.parse(JSON.stringify(next)); } };
}

function submittedCase(service) {
  return service.submit({ supplier: 'Suppression Supplier Ltd', evidenceReference: 'EVD-784', tablePurpose: 'Regional supplier analysis', minimumCellCount: 5 }, { id: 'owner-1', role: 'evidence_owner' });
}

describe('CellSuppressionControlService', () => {
  it('certifies a table only after disclosure and suppression controls', () => {
    const service = new CellSuppressionControlService(memoryStore());
    const caseRecord = submittedCase(service);
    service.transition(caseRecord.id, 'scan', { disclosureScanReference: 'SCN-784' }, { id: 'analyst-1', role: 'disclosure_analyst' });
    service.transition(caseRecord.id, 'review', { suppressionPlanReference: 'SUP-784' }, { id: 'steward-1', role: 'data_steward' });
    service.transition(caseRecord.id, 'approve', { approvalReference: 'APR-784' }, { id: 'authority-1', role: 'privacy_authority' });
    const certified = service.transition(caseRecord.id, 'certify', { releaseCertificateReference: 'CRT-784' }, { id: 'certifier-1', role: 'release_certifier' });
    expect(certified.status).toBe('certified');
    expect(certified.minimumCellCount).toBe(5);
  });

  it('rejects a zero minimum cell count without persistence', () => {
    const service = new CellSuppressionControlService(memoryStore());
    expect(() => service.submit({ supplier: 'Suppression Supplier Ltd', evidenceReference: 'EVD-784', tablePurpose: 'Analysis', minimumCellCount: 0 }, { id: 'owner-1', role: 'evidence_owner' })).toThrow('minimum cell count');
    expect(service.list()).toHaveLength(0);
  });
});
