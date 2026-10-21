import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, Handle, Position, BaseEdge } from '@xyflow/react';
import { ArrowUpRight, BookOpen, Check, ChevronDown, ChevronRight, Copy, FileText, GitBranch, Layers, List, Maximize2, Search, X } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import './styles.css';
import { phases, steps, byId, makeGraph, graphWidth } from './workflow.js';
import frameworkPdf from '../analysis-framework.pdf?url';

const Actions = createContext({});
const phaseOf = step => phases.find(p => p.id === step.phase);

function Ports({ recipe = false }) { return <><Handle id="workflow" type="target" position={Position.Top} />{recipe && <Handle id="recipe" type="target" position={Position.Left} />}<Handle type="source" position={Position.Bottom} /></>; }
function ConceptNode({ data }) {
  const { select, selected, highlight } = useContext(Actions);
  return <div className={`concept ${data.kind || ''} ${selected === data.id ? 'selected' : ''} ${highlight && data.recipe ? 'recipe-highlight' : ''}`} style={{ '--accent': phaseOf(data).color }}>
    <Ports recipe={data.recipe} />
    {data.id === 'multicollinearity' && <Handle id="revision" type="source" position={Position.Left} />}
    {data.id === 'multicollinearity' && <Handle id="finalized" type="source" position={Position.Right} />}
    {data.id === 'prep-train' && <Handle id="revision" type="target" position={Position.Left} style={{ top: '25%' }} />}
    {data.id === 'prep-test' && <><Handle id="finalized" type="target" position={Position.Top} style={{ left: '25%' }} /><Handle id="test-data" type="target" position={Position.Top} style={{ left: '75%' }} /></>}
    {data.id === 'evaluate' && <Handle id="predictors" type="target" position={Position.Right} />}
    {data.id === 'parameters' && <Handle id="scenario-guidance" type="source" position={Position.Left} />}
    {data.id === 'simulate' && <Handle id="scenario-guidance" type="target" position={Position.Right} />}
    {data.id === 'counter' && <Handle id="selected-model" type="target" position={Position.Right} />}
    {data.id === 'communicate' && <><Handle id="counter" type="target" position={Position.Top} style={{ left: '25%' }} /><Handle id="parameters" type="target" position={Position.Top} style={{ left: '75%' }} /></>}
    <button className="nodrag" onClick={() => select(data.id)} aria-label={`Open ${data.title}`} aria-pressed={selected === data.id}>
      <span className="node-kicker">{data.kind === 'data' ? 'DATASET' : data.recipe ? 'SHARED RECIPE' : 'STEP'}</span>
      <strong>{data.title}</strong><span className="node-subtitle">{data.subtitle}</span>
    </button>
  </div>;
}
function PhaseNode({ data }) {
  const { toggle } = useContext(Actions);
  return <button className="phase-heading nodrag" onClick={() => toggle(data.id)} aria-expanded={data.expanded} style={{ '--accent': data.color }}><span>{data.number}</span><strong>{data.title}</strong><i />{data.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>;
}
function SummaryNode({ data }) {
  const { toggle } = useContext(Actions);
  return <div className="summary-node" style={{ '--accent': data.color }}><Ports /><button className="nodrag" onClick={() => toggle(data.id)} aria-label={`Expand ${data.title}`}><strong>{data.title}</strong><span>{data.count} steps <ChevronDown size={14} /></span></button></div>;
}
function RecipeLabelNode() {
  return <div className="recipe-label"><strong>Preprocessing recipe</strong><span>Shared across all three steps</span><Handle type="source" position={Position.Right} /></div>;
}
const nodeTypes = { concept: ConceptNode, phase: PhaseNode, summary: SummaryNode, recipeLabel: RecipeLabelNode };
function RecipeConnector({ id, sourceX, sourceY, targetX, targetY, data, markerEnd, style }) {
  const path = data.routeAbove
    ? `M ${sourceX} ${sourceY} H 195 V ${targetY - 80} H ${targetX - 30} V ${targetY} H ${targetX}`
    : `M ${sourceX} ${sourceY} H 195 V ${targetY} H ${targetX}`;
  return <>
    <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
    <text x={data.routeAbove ? (195 + targetX - 30) / 2 : 185} y={targetY - (data.routeAbove ? 90 : 10)} textAnchor={data.routeAbove ? 'middle' : 'end'} className="recipe-edge-label">{data.label}</text>
  </>;
}
function RevisionLoop({ id, sourceX, sourceY, targetX, targetY, markerEnd, style }) {
  const gutterX = Math.min(sourceX, targetX) - 45;
  const labelX = gutterX - 10;
  const labelY = (sourceY + targetY) / 2;
  return <>
    <BaseEdge id={id} path={`M ${sourceX} ${sourceY} H ${gutterX} V ${targetY} H ${targetX}`} markerEnd={markerEnd} style={style} />
    <text x={labelX} y={labelY} transform={`rotate(-90 ${labelX} ${labelY})`} textAnchor="middle" className="revision-label">Yes: revise recipe</text>
  </>;
}
function ScenarioGuidance({ id, sourceX, sourceY, targetX, targetY, markerEnd, style }) {
  // Bridge over the selected-model line so the crossing cannot imply a junction.
  const center = 580;
  const path = `M ${sourceX} ${sourceY} H ${center + 10} Q ${center} ${sourceY - 18} ${center - 10} ${sourceY} H ${targetX} V ${targetY}`;
  return <>
    <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
    <text x={(sourceX + targetX) / 2} y={sourceY - 22} textAnchor="middle" className="revision-label">Inform scenario choices</text>
  </>;
}
function SelectedModel({ id, sourceX, sourceY, targetX, targetY, markerEnd, style }) {
  return <BaseEdge id={id} path={`M ${sourceX} ${sourceY} V ${targetY} H ${targetX}`} markerEnd={markerEnd} style={style} />;
}
function RecommendationBranch({ id, sourceX, sourceY, targetX, targetY, markerEnd, style }) {
  return <BaseEdge id={id} path={`M ${sourceX} ${sourceY} V ${targetY - 100} H ${targetX} V ${targetY}`} markerEnd={markerEnd} style={style} />;
}
const edgeTypes = { recipeConnector: RecipeConnector, revisionLoop: RevisionLoop, scenarioGuidance: ScenarioGuidance, selectedModel: SelectedModel, recommendationBranch: RecommendationBranch };

function DetailPanel({ selected, close }) {
  const step = byId[selected];
  const phase = phaseOf(step);
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkError, setLinkError] = useState(false);
  useEffect(() => { setLinkCopied(false); setLinkError(false); }, [selected]);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${location.href.split('#')[0]}#${selected}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    } catch { setLinkError(true); }
  }
  return <>
    <div className="panel-top"><span><BookOpen size={14} /> CONCEPT NOTES</span><button className="icon-button close-panel" onClick={close} aria-label="Close concept notes"><X size={18} /></button><button className="copy-link" onClick={copyLink}>{linkCopied ? <Check size={13} /> : <Copy size={13} />}{linkCopied ? 'Link copied' : 'Copy link'}</button></div>
    {linkError && <p role="status">Copy this concept's link from your browser's address bar.</p>}
    <div className="panel-body" key={selected}>
      <div className="eyebrow" style={{ color: phase.color }}>{phase.number} / {phase.title}</div>
      <h2>{step.title}</h2>
      <section className="step-description"><h3>Inputs</h3><p>{step.input}</p></section>
      <section className="step-description"><h3>What to do</h3>{step.purposeSections ? step.purposeSections.map(section => <div className="step-subsection" key={section.title}><h4>{section.title}</h4><p>{section.description}</p></div>) : <p>{step.purpose}</p>}</section>
      <section className="step-description"><h3>Outputs</h3><p>{step.output}</p></section>
    </div>
  </>;
}

export default function App() {
  const initialId = byId[location.hash.slice(1)] ? location.hash.slice(1) : 'prep-train';
  const [selected, setSelected] = useState(initialId);
  const [expanded, setExpanded] = useState(new Set(phases.map(p => p.id)));
  const [query, setQuery] = useState('');
  const [view, setView] = useState(window.innerWidth < 900 ? 'reading' : 'map');
  const [highlight, setHighlight] = useState(false);
  const [detailOpen, setDetailOpen] = useState(window.innerWidth >= 900 || Boolean(byId[location.hash.slice(1)]));
  const [width, setWidth] = useState(780);
  const canvas = useRef(null);
  const detail = useRef(null);
  const searchRef = useRef(null);
  const graph = useMemo(() => makeGraph(expanded), [expanded]);
  const scale = Math.min(1, Math.max(0.3, (width - 52) / graphWidth));
  const matches = query.trim() ? steps.filter(step => `${step.title} ${step.subtitle} ${step.input} ${step.purpose} ${step.purposeSections?.map(section => `${section.title} ${section.description}`).join(' ') || ''} ${step.output}`.toLowerCase().includes(query.trim().toLowerCase())) : [];
  function select(id) {
    setSelected(id); setExpanded(prev => new Set([...prev, byId[id].phase])); setQuery(''); setDetailOpen(true);
    if (location.hash !== `#${id}`) location.hash = id;
    detail.current?.scrollTo({ top: 0 });
  }
  function toggle(id) { setExpanded(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  useEffect(() => {
    const handle = () => { const id = location.hash.slice(1); if (byId[id]) { setSelected(id); setDetailOpen(true); setExpanded(prev => new Set([...prev, byId[id].phase])); detail.current?.scrollTo({ top: 0 }); } };
    window.addEventListener('hashchange', handle); return () => window.removeEventListener('hashchange', handle);
  }, []);
  useEffect(() => { if (!canvas.current) return; const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width)); observer.observe(canvas.current); return () => observer.disconnect(); }, []);
  useEffect(() => { detail.current?.scrollTo({ top: 0, behavior: 'instant' }); }, [selected]);
  useEffect(() => { if (highlight) setExpanded(prev => new Set([...prev, 'model', 'interpret'])); }, [highlight]);
  useEffect(() => { function key(e) { if (e.key === 'Escape') { setQuery(''); setDetailOpen(false); searchRef.current?.focus(); } } document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key); }, []);
  return <Actions.Provider value={{ select, selected, toggle, highlight }}>
    <a href="#framework-content" className="skip-link">Skip to framework</a>
    <header className="site-header"><a className="brand" href={location.pathname} aria-label="Analysis Framework home"><span className="brand-symbol"><GitBranch size={20} /></span><strong>MKTG <b>411</b></strong><span className="brand-divider" /><span>THE ANALYTICS FIELD GUIDE</span></a><a className="source-link" href={frameworkPdf} target="_blank" rel="noreferrer"><FileText size={15} />Original framework<ArrowUpRight size={14} /></a></header>
    <section className="intro"><div><div className="eyebrow">FROM A BUSINESS OBJECTIVE TO A BETTER DECISION</div><h1>Your analysis, <em>connected.</em></h1><p>Follow the workflow. Open a concept. Understand what comes next.</p></div><div className="goal"><span className="goal-mark">↗</span><div><span className="small-label">THE GOAL</span><p>Provide data-based recommendations<br />to solve a business problem.</p></div></div></section>
    <div className="toolbar"><div className="view-switch" aria-label="View"> <button aria-pressed={view === 'map'} onClick={() => setView('map')}><GitBranch size={15} />Workflow</button><button aria-pressed={view === 'reading'} onClick={() => setView('reading')}><List size={16} />Reading view</button></div><div className="expand-actions"><button onClick={() => setExpanded(new Set(phases.map(p => p.id)))}><Maximize2 size={14} />Expand all</button><button onClick={() => setExpanded(new Set())}><Layers size={14} />Overview</button></div><div className="search"><Search size={16} /><input ref={searchRef} aria-label="Search steps and descriptions" placeholder="Find a step…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && matches.length) select(matches[0].id); }} />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}{query.trim() && <div className="search-results"><span className="small-label" role="status">{matches.length} {matches.length === 1 ? 'CONCEPT' : 'CONCEPTS'} FOUND</span>{matches.map(step => <button key={step.id} onClick={() => select(step.id)}>{step.title}<ArrowUpRight size={14} /></button>)}{!matches.length && <p>Try “training”, “predict”, or “recommend”.</p>}</div>}</div></div>
    <main id="framework-content" className={`workspace ${detailOpen ? 'detail-open' : ''}`}>
      <section className="map-pane" aria-label="Analytics workflow">
        <div className="map-legend"><span><i />{steps.length} connected concepts</span><button className={highlight ? 'active' : ''} onClick={() => setHighlight(!highlight)} aria-pressed={highlight}><span className="recipe-dot" />Shared preprocessing recipe</button></div>
        <div className="map-scroll" ref={canvas}>
          {view === 'map' ? <div className="flow-wrapper" style={{ height: graph.height * scale + 50 }}><ReactFlow nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} viewport={{ x: (width - graphWidth * scale) / 2, y: 22, zoom: scale }} minZoom={0.2} maxZoom={1.5} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} panOnDrag={false} zoomOnScroll={false} zoomOnPinch={false} zoomOnDoubleClick={false} preventScrolling={false} nodesFocusable={false} edgesFocusable={false} onNodeClick={(_, node) => { if (byId[node.id]) select(node.id); }} /></div> : <div className="reading-view">{phases.map(phase => <section key={phase.id} style={{ '--accent': phase.color }}><button className="reading-heading" onClick={() => toggle(phase.id)} aria-expanded={expanded.has(phase.id)}><span>{phase.number}</span><strong>{phase.title}</strong><ChevronDown size={18} /></button><p>{phase.summary}</p>{expanded.has(phase.id) && steps.filter(step => step.phase === phase.id).map(step => <button className={`reading-step ${selected === step.id ? 'selected' : ''} ${highlight && step.recipe ? 'recipe-highlight' : ''}`} key={step.id} onClick={() => select(step.id)}><span><strong>{step.title}</strong><small>{step.subtitle}</small></span>{step.recipe ? <span className="reading-recipe">RECIPE</span> : <ArrowUpRight size={16} />}</button>)}</section>)}</div>}
          <div className="map-footer"><span>START WITH THE QUESTION. FINISH WITH THE DECISION.</span><p>Open any step for its inputs, what to do, and outputs.</p></div>
        </div>
      </section>
      <aside ref={detail} className="detail-pane" aria-label="Concept notes"><DetailPanel selected={selected} close={() => setDetailOpen(false)} /></aside>
    </main>
  </Actions.Provider>;
}

