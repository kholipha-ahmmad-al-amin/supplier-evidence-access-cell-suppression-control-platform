import express from 'express';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CellSuppressionControlService } from './domain.mjs';
import { AtomicJsonStore } from './store.mjs';

const directory = fileURLToPath(new URL('.', import.meta.url));
const service = new CellSuppressionControlService(new AtomicJsonStore(join(directory, 'data', 'cell-suppression-cases.json')));
const app = express();
app.use(express.json());

function actorFrom(request) { return { id: request.get('x-actor-id'), role: request.get('x-actor-role') }; }
function sendCase(response, operation) { try { response.json({ case: operation() }); } catch (error) { response.status(422).json({ error: error.message }); } }

app.get('/health', (_request, response) => response.json({ status: 'ok' }));
app.get('/v1/cases', (_request, response) => response.json({ cases: service.list() }));
app.post('/v1/cases', (request, response) => {
  try { response.status(201).json({ case: service.submit(request.body, actorFrom(request)) }); } catch (error) { response.status(422).json({ error: error.message }); }
});
for (const action of ['scan', 'review', 'approve', 'certify']) {
  app.post(`/v1/cases/:id/${action}`, (request, response) => sendCase(response, () => service.transition(request.params.id, action, request.body, actorFrom(request))));
}
app.listen(Number(process.env.PORT || 65523), '0.0.0.0');
