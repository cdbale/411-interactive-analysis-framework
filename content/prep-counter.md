# Preprocess counterfactual data

Your “what if” scenarios are new observations for the selected model. Apply its fitted recipe before predicting so the scenarios use the same representation as the training data.

## What happens here?

Construct scenarios in the **original business units** and include all required predictors with compatible types. Then reuse the selected model's fitted preprocessing. You do not need an observed outcome to make a prediction.

**You leave with:** comparable scenario predictions, expressed in the outcome's units when the outcome was not transformed.

## Functions to know

- [`tibble()`](https://tibble.tidyverse.org/reference/tibble.html): describe scenario rows and their predictor values.
- [`bake()`](https://recipes.tidymodels.org/reference/bake.html): apply the fitted preprocessing to those rows.
- [`predict()`](https://workflows.tidymodels.org/reference/predict-workflow.html): generate predictions from the selected model or fitted workflow.

## Worked example · R

Continue from the training example. Compare two synthetic scenarios that differ in ad spend while price and channel stay fixed.

```r
scenarios <- tibble(
  ad_spend = c(40, 60),
  price = c(10, 10),
  channel = factor(c("Search", "Search"),
                   levels = levels(train_data$channel))
)

scenario_processed <- bake(trained_rec,
                           new_data = scenarios)

scenario_results <- predict(model,
                           new_data = scenario_processed) |>
  bind_cols(scenarios)

scenario_results
```

With a fitted workflow, use the raw scenarios directly:

```r
scenario_results <- predict(fitted_workflow,
                           new_data = scenarios) |>
  bind_cols(scenarios)
```

## Common mistakes

- **Fitting preprocessing on scenario rows:** two imagined scenarios are not a new training sample. Reuse the fitted recipe.
- **Changing units:** if training spend was measured in thousands of dollars, use that same unit when creating scenarios.
- **Supplying unfamiliar categories:** check whether the fitted recipe supports new levels before predicting.
- **Equating predictions with causal effects:** a predicted difference alone does not establish what an intervention would cause. Explain assumptions and the limits of extrapolating beyond observed data.

## Check your understanding

If you change a scenario's ad spend from 40 to 60, should the recipe's training mean change?

**Answer:** no. Scenario inputs change; the fitted transformation stays fixed.

## Further reading

- [Apply a trained recipe](https://recipes.tidymodels.org/reference/bake.html)
- [Predict with a workflow](https://workflows.tidymodels.org/reference/predict-workflow.html)
