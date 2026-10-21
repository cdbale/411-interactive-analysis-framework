import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { phases, steps, edges, recipeIds, makeGraph } from '../src/workflow.js';

test('every source concept has a route to the business recommendation', () => {
  assert.equal(steps.length, 18);
  const ids = new Set(steps.map(s => s.id));
  assert.equal(ids.size, steps.length);
  for (const [a, b] of edges) { assert.ok(ids.has(a)); assert.ok(ids.has(b)); }
  function reachesRecommendation(id, visited = new Set()) {
    if (id === 'communicate') return true;
    if (visited.has(id)) return false;
    visited.add(id);
    return edges.filter(([a]) => a === id).some(([, b]) => reachesRecommendation(b, new Set(visited)));
  }
  for (const step of steps) assert.ok(reachesRecommendation(step.id), `${step.id} must lead to recommendations`);
});

test('all 32 phase combinations produce complete, deduplicated visible connections', () => {
  for (let mask = 0; mask < 2 ** phases.length; mask++) {
    const expanded = new Set(phases.filter((_, i) => mask & (1 << i)).map(p => p.id));
    const graph = makeGraph(expanded);
    const ids = new Set(graph.nodes.map(n => n.id));
    assert.equal(new Set(graph.edges.map(e => e.id)).size, graph.edges.length);
    for (const edge of graph.edges) {
      assert.ok(ids.has(edge.source), `Missing visible source ${edge.source}`);
      assert.ok(ids.has(edge.target), `Missing visible target ${edge.target}`);
      assert.notEqual(edge.source, edge.target);
    }
    for (const step of steps) assert.ok(ids.has(expanded.has(step.phase) ? step.id : `summary-${step.phase}`));
  }
});

test('training, held-out evaluation, and scenario branches remain separate', () => {
  const hasEdge = (a, b) => edges.some(([source, target]) => source === a && target === b);
  assert.ok(hasEdge('test', 'prep-test'));
  assert.ok(hasEdge('prep-test', 'evaluate'));
  assert.ok(!hasEdge('test', 'fit'));
  assert.ok(!hasEdge('fit', 'evaluate'));
  assert.ok(hasEdge('fit', 'multicollinearity'));
  assert.ok(hasEdge('multicollinearity', 'evaluate'));
  assert.ok(hasEdge('multicollinearity', 'prep-test'));
  assert.ok(hasEdge('multicollinearity', 'prep-train'));
  assert.ok(hasEdge('best', 'counter'));
  assert.ok(hasEdge('best', 'parameters'));
  assert.ok(hasEdge('simulate', 'prep-counter'));
  assert.ok(hasEdge('prep-counter', 'counter'));
});

test('test preprocessing follows recipe finalization while checked models feed evaluation directly', () => {
  const graph = makeGraph(new Set(phases.map(phase => phase.id)));
  const position = id => graph.nodes.find(node => node.id === id).position.y;
  assert.ok(position('multicollinearity') < position('prep-test'));
  assert.ok(position('prep-test') < position('evaluate'));
  const incoming = graph.edges.filter(edge => edge.target === 'evaluate').map(edge => edge.source);
  assert.deepEqual(new Set(incoming), new Set(['multicollinearity', 'prep-test']));
  assert.ok(graph.edges.some(edge => edge.source === 'multicollinearity' && edge.target === 'prep-test' && edge.label === 'No — recipe finalized'));
});

test('preprocessing lessons supply functions, examples, mistakes and sources', () => {
  for (const id of recipeIds) {
    const content = readFileSync(new URL(`../content/${id}.md`, import.meta.url), 'utf8');
    for (const section of ['Functions to know', 'Worked example', 'Common mistakes', 'Further reading']) assert.ok(content.includes(`## ${section}`), `${id}: ${section}`);
    assert.ok(content.includes('```r'));
    assert.ok(content.includes('https://recipes.tidymodels.org'));
  }
});

test('interpretation informs scenario choices while both branches independently reach recommendations', () => {
  const hasEdge = (source, target) => edges.some(([a, b]) => a === source && b === target);
  assert.ok(hasEdge('parameters', 'simulate'));
  assert.ok(hasEdge('parameters', 'communicate'));
  assert.ok(hasEdge('counter', 'communicate'));
  assert.ok(!hasEdge('parameters', 'counter'));
  const graph = makeGraph(new Set(phases.map(phase => phase.id)));
  const guidance = graph.edges.find(edge => edge.source === 'parameters' && edge.target === 'simulate');
  assert.equal(guidance.style.strokeDasharray, '5 4');
  const position = id => graph.nodes.find(node => node.id === id).position;
  assert.equal(position('simulate').x, position('counter').x);
  assert.ok(position('parameters').x > position('counter').x);
});
