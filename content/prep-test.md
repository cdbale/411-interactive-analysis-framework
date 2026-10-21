# Preprocess test data

Apply the recipe you already learned from training data. Test observations receive the same transformations, so the model sees the same predictor representation.

## What happens here?

Use the fitted recipe's training medians, means, standard deviations, and category encoding. **Do not estimate a second recipe from the test data.** Keep observed outcomes available for evaluating the predictions, but out of the predictors.

**You leave with:** processed test predictors, followed by predictions that can be compared with observed outcomes.

## Functions to know

- [`bake(trained_rec, new_data = test_data)`](https://recipes.tidymodels.org/reference/bake.html): explicitly apply the trained recipe.
- [`predict(fitted_workflow, new_data = test_data)`](https://workflows.tidymodels.org/reference/predict-workflow.html): let a fitted workflow apply its recipe and generate predictions together.
- [`rmse()`](https://yardstick.tidymodels.org/reference/rmse.html) and [`mae()`](https://yardstick.tidymodels.org/reference/mae.html): summarize prediction errors for numeric outcomes.

## Worked example · R

Continue from the training example. These objects already exist: `trained_rec`, `model`, and `test_data`.

```r
test_processed <- bake(trained_rec, new_data = test_data)

test_results <- predict(model, new_data = test_processed) |>
  bind_cols(test_data |> select(sales))

rmse(test_results, truth = sales, estimate = .pred)
mae(test_results, truth = sales, estimate = .pred)
```

If you fitted a workflow instead, provide the **raw** test data:

```r
test_results <- predict(fitted_workflow,
                        new_data = test_data) |>
  bind_cols(test_data |> select(sales))
```

## Common mistakes

- **Calling prep() on test data:** that learns a different transformation and lets evaluation data influence the analysis.
- **Baking twice:** use either manual preprocessing with the standalone model, or raw data with the fitted workflow.
- **Repeatedly tuning against test performance:** use validation or cross-validation inside training data for model selection when you need an unbiased final test estimate.

## Check your understanding

The training recipe fills missing ad spend with 58. A test observation is missing ad spend. Which value fills it?

**Answer:** 58, the value already learned from training data. Do not calculate a new median from the test observations.

## Further reading

- [Apply a trained recipe](https://recipes.tidymodels.org/reference/bake.html)
- [Predict with a workflow](https://workflows.tidymodels.org/reference/predict-workflow.html)
