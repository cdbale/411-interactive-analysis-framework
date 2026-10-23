export const phases = [
  { id: 'explore', number: '01', title: 'Define & explore', color: '#58746c', summary: 'Start with a business decision. Understand the data you have.' },
  { id: 'prepare', number: '02', title: 'Split the data', color: '#56788a', summary: 'Separate the data used to learn from the data used to evaluate.' },
  { id: 'model', number: '03', title: 'Fit & evaluate', color: '#247264', summary: 'Learn a recipe and models on training data, then evaluate predictions.' },
  { id: 'interpret', number: '04', title: 'Interpret & simulate', color: '#a57737', summary: 'Explore what the model says and what could happen under a different scenario.' },
  { id: 'recommend', number: '05', title: 'Recommend', color: '#76648b', summary: 'Turn the evidence into a clear recommendation for the business.' },
];

// Grid positions within each phase, including the added multicollinearity revision loop.
export const steps = [
  { id: 'problem', phase: 'explore', title: 'Identify the business objective', subtitle: 'What decision are we helping make?', x: 245, y: 0, input: 'A business objective, and the needs of decision makers.', purpose: 'Translate a business objective into a specific question that data can help answer.', output: 'Define an outcome to measure and a definition of success.' },
  { id: 'import', phase: 'explore', title: 'Import the data', subtitle: 'Bring the relevant data into R', x: 245, y: 130, input: 'The business objective and the relevant data files or data sources.', purpose: 'Load the data and inspect its structure, variable types, and units.', output: 'A reproducible import and a clear understanding of each column.' },
  { id: 'full', phase: 'explore', title: 'Full data', subtitle: 'The starting dataset', kind: 'data', x: 245, y: 260, input: 'The imported data, including the observations and variables available for analysis.', purpose: 'Keep the original data available so your analysis can be rerun and checked.', output: 'An intact source dataset.' },
  { id: 'eda', phase: 'explore', title: 'Explore & clean', subtitle: 'Understand patterns and data quality', x: 245, y: 380, input: 'The full dataset, variable definitions, and the business objective.', purpose: 'Investigate distributions, missing values, duplicates, implausible values, outliers, and relationships.', purposeSections: [
    { title: 'Cleaning', description: 'Check for and address missing values, duplicates (when appropriate), and implausible values.' },
    { title: 'Exploration', description: 'Investigate distributions, outliers, and relationships between cleaned variables.' },
  ], output: 'Documented cleaning decisions and preliminary evidence for modeling.', note: 'Keep data-dependent modeling choices within the training data. Learn imputation values, scaling, and other fitted transformations after the split.' },
  { id: 'split', phase: 'prepare', title: 'Split into train & test', subtitle: 'Give each subset a distinct role', x: 245, y: 0, input: 'The cleaned data set.', purpose: 'Create separate training and test subsets.', output: 'Training and test datasets with a reproducible split.' },
  { id: 'train', phase: 'prepare', title: 'Training data', subtitle: 'Used to learn', kind: 'data', x: 95, y: 150, input: 'The observations assigned to the training subset during the split.', purpose: 'Use this subset to learn preprocessing parameters and estimate model parameters.', output: 'The observations available for model development.' },
  { id: 'test', phase: 'prepare', title: 'Test data', subtitle: 'Used to evaluate', kind: 'data', x: 405, y: 150, input: 'The observations assigned to the test subset during the split.', purpose: 'Set these observations aside from fitting so you can evaluate predictions on held-out data.', output: 'Held-out observations and outcomes for evaluation.' },
  { id: 'prep-train', phase: 'model', title: 'Preprocess training data', subtitle: 'Learn and revise the recipe here', recipe: true, x: 95, y: 0, input: 'Training data and a recipe specifying the transformations needed for the model.', purpose: 'Define transformations and estimate their parameters using training data only.', output: 'A fitted recipe and preprocessed training predictors.' },
  { id: 'fit', phase: 'model', title: 'Fit model(s)', subtitle: 'Fit = train = estimate', x: 95, y: 150, input: 'Preprocessed training predictors, their observed outcomes, and the candidate model specifications.', purpose: 'Estimate candidate models using the preprocessed training data. Fit, train, and estimate are synonyms in this step.', output: 'Fitted candidate models.' },
  { id: 'multicollinearity', phase: 'model', title: 'Check for multicollinearity', subtitle: 'Multicollinearity present?', x: 95, y: 310, input: 'Fitted candidate models, preprocessed training predictors, and the business objective.', purpose: 'Check for multicollinearity among the training predictors. If found, return to preprocessing and drop variables according to the business objective. Update the shared recipe, refit the models, and check again. Apply the updated recipe to test data before evaluating predictive accuracy.', output: 'If multicollinearity is found: a decision about which variables to drop in preprocessing. If not: models ready for predictive evaluation.' },
  { id: 'prep-test', phase: 'model', title: 'Preprocess test data', subtitle: 'Apply the finalized recipe', recipe: true, x: 405, y: 520, input: 'Test data and the fitted preprocessing recipe finalized after the multicollinearity check.', purpose: 'After the multicollinearity check is complete, apply the finalized recipe learned from training data to the test predictors.', output: 'Preprocessed test predictors.' },
  { id: 'evaluate', phase: 'model', title: 'Evaluate predictive accuracy', subtitle: 'Compare predictions with outcomes', x: 95, y: 740, input: 'Fitted candidate models, preprocessed test predictors, and the observed test outcomes.', purpose: 'Generate predictions for test observations and compare them with the observed outcomes.', output: 'Comparable performance metrics for each candidate model.' },
  { id: 'best', phase: 'model', title: 'Identify the best predictive fit', subtitle: 'Lower error is better', x: 245, y: 900, input: 'Predictive performance metrics for the candidate models, evaluated on the same test observations.', purpose: 'Compare models using the same evaluation data and the metric appropriate to the business objective; e.g., MAE applies to continuous numeric outcomes. For error measures like MAE, choose the model with the lowest value.', output: 'A selected model and an explanation of its performance.', note: 'The source framework compares models on test data. For an unbiased final performance estimate, select and tune models using validation or cross-validation within training data, then evaluate once on an untouched final test set.' },
  { id: 'parameters', phase: 'interpret', title: 'Interpret parameter estimates', subtitle: 'Assess statistical and practical significance.', x: 490, y: 0, input: 'The selected fitted model, its parameter estimates, and the definitions and units of the variables.', purpose: 'Describe associations using point estimates for average effects, accounting for variable units, transformations from preprocessing steps, and the model specification. Use confidence intervals to assess statistical significance and the range of plausible effect sizes. Assess practical significance by considering whether those effect sizes are meaningful for the business objective.', output: 'An explanation of associations, their statistical significance, and their practical significance in relation to the business objective.' },
  { id: 'simulate', phase: 'interpret', title: 'Simulate counterfactual data', subtitle: 'Describe a plausible “what if”', x: 0, y: 0, input: 'The business objective, the predictors required by the model, and plausible values for the scenarios you want to compare.', purpose: 'Create plausible scenarios by varying the predictors relevant to the business decision. Use the parameter interpretations to inform scenario choices.', output: 'A dataset of scenarios with the predictor columns the model expects.' },
  { id: 'prep-counter', phase: 'interpret', title: 'Preprocess counterfactual data', subtitle: 'Apply the finalized recipe', recipe: true, x: 0, y: 155, input: 'Counterfactual scenario data and the fitted recipe used by the selected model.', purpose: 'Apply the same fitted recipe to your scenarios before generating model predictions.', output: 'Preprocessed counterfactual predictors.' },
  { id: 'counter', phase: 'interpret', title: 'Generate counterfactual predictions', subtitle: 'Use the selected model', x: 0, y: 310, input: 'The selected fitted model and the preprocessed counterfactual predictors.', purpose: 'Predict the outcome for each scenario using the selected model.', output: 'Predicted outcomes and comparisons across plausible scenarios.', note: 'A model-based scenario is not automatically a causal estimate. State the assumptions needed to interpret it as the effect of an intervention.' },
  { id: 'communicate', phase: 'recommend', title: 'Communicate recommendations', subtitle: 'Connect the evidence to a decision', x: 245, y: 0, input: 'The original business objective, model performance, counterfactual predictions, and interpretation of the results.', purpose: 'Recommend an action grounded in the business objective, predictions, and interpretation. Make recommendations on next steps.', output: 'A clear recommendation with expected implications, assumptions, limitations, and recommended next steps.' },
];

export const edges = [
  ['problem', 'import'], ['import', 'full'], ['full', 'eda'], ['eda', 'split'],
  ['split', 'train'], ['split', 'test'], ['train', 'prep-train'], ['test', 'prep-test'],
  ['prep-train', 'fit'], ['fit', 'multicollinearity'], ['multicollinearity', 'evaluate'], ['multicollinearity', 'prep-test'], ['multicollinearity', 'prep-train'], ['prep-test', 'evaluate'], ['evaluate', 'best'],
  ['best', 'counter'], ['best', 'parameters'], ['simulate', 'prep-counter'], ['prep-counter', 'counter'],
  ['counter', 'communicate'], ['parameters', 'communicate'], ['parameters', 'simulate'],
];

export const recipeIds = ['prep-train', 'prep-test', 'prep-counter'];
// Condensed from Lecture 10's Preprocessing Guide table.
export const recipeGuide = [
  { title: 'Missing values', description: 'Zeros are not missing. Drop missing rows or justify another strategy.', tools: 'drop_na()' },
  { title: 'Continuous predictors', description: 'If skewed, test whether a log transformation helps.', tools: 'step_log(..., offset = 1)' },
  { title: 'Binary predictors', description: 'Keep 0/1, with 0 as the reference. Do not log or add another indicator.' },
  { title: 'Categorical predictors', description: 'Choose a reference level; create k − 1 indicators.', tools: 'fct_relevel() → step_dummy()' },
  { title: 'Continuous outcome', description: 'If skewed, compare raw and logged models. Reverse log(x + 1) predictions with exp(.pred) − 1.', tools: 'step_log(..., offset = 1)' },
  { title: 'Optional numeric tools', description: 'Standardize scales, remove highly correlated inputs, or create bins.', tools: 'step_normalize() / step_corr() / step_discretize()' },
];
export const recipeConcept = {
  id: 'shared-recipe', phase: 'model', title: 'Preprocessing recipe',
  subtitle: 'Learn and revise on training data. Apply the finalized recipe to test data and counterfactuals.',
};
export const recipeBoxHeight = 150;
export const graphWidth = 940;
export const byId = Object.fromEntries([...steps, recipeConcept].map(step => [step.id, step]));

export function makeGraph(expanded) {
  let top = 0;
  const nodes = [];
  for (const phase of phases) {
    nodes.push({ id: `heading-${phase.id}`, type: 'phase', position: { x: 220, y: top }, data: { ...phase, expanded: expanded.has(phase.id) }, draggable: false });
    top += 70;
    if (expanded.has(phase.id)) {
      const children = steps.filter(step => step.phase === phase.id);
      for (const step of children) {
        nodes.push({ id: step.id, type: 'concept', position: { x: step.x + 220, y: top + step.y }, data: step, draggable: false });
      }
      top += Math.max(...children.map(step => step.y)) + 160;
    } else {
      nodes.push({ id: `summary-${phase.id}`, type: 'summary', position: { x: 465, y: top }, data: { ...phase, count: steps.filter(step => step.phase === phase.id).length }, draggable: false });
      top += 145;
    }
  }
  const mapped = edges.map(([source, target]) => [expanded.has(byId[source].phase) ? source : `summary-${byId[source].phase}`, expanded.has(byId[target].phase) ? target : `summary-${byId[target].phase}`]);
  const unique = [...new Set(mapped.filter(([a, b]) => a !== b).map(pair => pair.join('|')))];
  const workflowEdges = unique.map(pair => {
    const [source, target] = pair.split('|');
    const revision = source === 'multicollinearity' && target === 'prep-train';
    const proceed = source === 'multicollinearity' && target === 'evaluate';
    const finalized = source === 'multicollinearity' && target === 'prep-test';
    const predictors = source === 'prep-test' && target === 'evaluate';
    const scenarioGuidance = source === 'parameters' && target === 'simulate';
    const modelToScenario = (source === 'best' || source === 'summary-model') && target === 'counter';
    const recommendation = target === 'communicate' && (source === 'parameters' || source === 'counter');
    const label = proceed ? 'Checked models' : finalized ? 'No — recipe finalized' : predictors ? 'Preprocessed test predictors' : null;
    return {
      id: pair, source, target,
      ...(revision ? { sourceHandle: 'revision', targetHandle: 'revision', type: 'revisionLoop' } : { targetHandle: 'workflow', type: 'smoothstep' }),
      ...(finalized ? { sourceHandle: 'finalized', targetHandle: 'finalized' } : {}),
      ...(target === 'prep-test' && !finalized ? { targetHandle: 'test-data' } : {}),
      ...(predictors ? { targetHandle: 'predictors' } : {}),
      ...(scenarioGuidance ? { sourceHandle: 'scenario-guidance', targetHandle: 'scenario-guidance', type: 'scenarioGuidance' } : {}),
      ...(modelToScenario ? { targetHandle: 'selected-model', type: 'selectedModel' } : {}),
      ...(recommendation ? { targetHandle: source, type: 'recommendationBranch' } : {}),
      ...(label ? { label, labelStyle: { fill: '#247264', fontSize: 11 }, labelBgStyle: { fill: '#f3f5ee' }, labelBgPadding: [6, 4], labelBgBorderRadius: 4 } : {}),
      markerEnd: { type: 'arrowclosed', width: 15, height: 15 },
      style: { stroke: revision || scenarioGuidance ? '#a57737' : '#a6b4af', strokeWidth: revision ? 1.8 : 1.6, ...(scenarioGuidance ? { strokeDasharray: '5 4' } : {}) },
      pathOptions: { borderRadius: 14 },
    };
  });
  const visibleRecipeNodes = nodes.filter(node => recipeIds.includes(node.id));
  if (visibleRecipeNodes.length) {
    const centers = visibleRecipeNodes.map(node => node.position.y + 54.5);
    nodes.push({ id: 'shared-recipe', type: 'recipeLabel', position: { x: 0, y: Math.max(0, (Math.min(...centers) + Math.max(...centers)) / 2 - recipeBoxHeight / 2) }, data: {}, draggable: false });
  }
  const recipeEdges = visibleRecipeNodes.map(node => ({ id: `recipe-use-${node.id}`, source: 'shared-recipe', target: node.id, targetHandle: 'recipe', type: 'recipeConnector', data: { routeAbove: node.id === 'prep-test', label: node.id === 'prep-train' ? 'Learn/revise' : 'Apply finalized recipe' }, markerEnd: { type: 'arrowclosed', width: 13, height: 13 }, style: { stroke: '#65865b', strokeWidth: 1.5, strokeDasharray: '4 3' } }));
  const recipeBox = nodes.find(node => node.id === 'shared-recipe');
  return { nodes, edges: [...workflowEdges, ...recipeEdges], height: Math.max(top + 15, recipeBox ? recipeBox.position.y + recipeBoxHeight + 30 : 0) };
}
