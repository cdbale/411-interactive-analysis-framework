# Preprocess training data

The training data teaches the recipe how to transform predictors. Save that fitted recipe so every later dataset receives the same treatment.

## What happens here?

1. **Define** the outcome, predictors, and sequence of preprocessing steps.
2. **Learn** the required values from training data: for example, medians for imputation and means and standard deviations for normalization.
3. **Apply** those learned transformations to the training data before fitting the model.

**You leave with:** a fitted recipe and training predictors ready for modeling. The recipe is a reusable object, not a new set of rules for each dataset.

## Functions to know

- [`recipe()`](https://recipes.tidymodels.org/reference/recipe.html): declare the outcome and predictors.
- [`step_impute_median()`](https://recipes.tidymodels.org/reference/step_impute_median.html): fill missing numeric predictors using training medians.
- [`step_normalize()`](https://recipes.tidymodels.org/reference/step_normalize.html): center and scale numeric predictors.
- [`step_dummy()`](https://recipes.tidymodels.org/reference/step_dummy.html): represent categorical predictors with indicator columns.
- [`prep()`](https://recipes.tidymodels.org/reference/prep.html): estimate the recipe's parameters from training data.
- [`bake()`](https://recipes.tidymodels.org/reference/bake.html): apply the fitted recipe to a dataset.

Choose steps for the model and data. For example, normalization can matter for distance-based methods but is generally unnecessary for decision trees.

## Worked example · R

This self-contained example uses **synthetic marketing data**. Run it in R with `tidymodels` installed. The browser displays code; it does not execute R. The explicit `prep()` and `bake()` calls make the learning and application steps visible.

```r
library(tidymodels)
set.seed(411)

# Invented observations for learning the workflow.
marketing <- tibble(
  ad_spend = runif(100, 20, 100),
  price = runif(100, 8, 15),
  channel = factor(rep(c("Search", "Social"), 50))
) |>
  mutate(sales = 180 + 3 * ad_spend - 7 * price +
           15 * (channel == "Search") + rnorm(100, 0, 15))

split <- initial_split(marketing, prop = 0.8)
train_data <- training(split)
test_data <- testing(split)

rec <- recipe(sales ~ ad_spend + price + channel,
              data = train_data) |>
  step_impute_median(all_numeric_predictors()) |>
  step_normalize(all_numeric_predictors()) |>
  step_dummy(all_nominal_predictors())

# Learn preprocessing parameters ONLY from training data.
trained_rec <- prep(rec, training = train_data)
train_processed <- bake(trained_rec, new_data = NULL)

# Fit the model to the processed training data.
model <- linear_reg() |>
  set_engine("lm") |>
  fit(sales ~ ., data = train_processed)
```

The simple example assumes familiar, nonmissing channel values. Real data may also need explicit handling of missing or previously unseen categories.

## Using a workflow instead

Your course also uses workflows to keep the recipe and model together. Starting with the **unfitted** `rec` from the example above:

```r
model_workflow <- workflow() |>
  add_recipe(rec) |>
  add_model(linear_reg() |> set_engine("lm"))

fitted_workflow <- fit(model_workflow, data = train_data)

# Supply raw predictors; the workflow applies the recipe.
test_predictions <- predict(fitted_workflow,
                            new_data = test_data)
```

Fitting the workflow learns preprocessing and model parameters. Predicting with it applies the fitted preprocessing automatically. **Do not manually bake the data before passing it to this fitted workflow.**

## Common mistakes

- **Prepping on the full dataset:** the held-out data then influences learned transformations. Split first, then estimate preprocessing from training data.
- **Normalizing the outcome accidentally:** use predictor selectors when the intention is to transform predictors only.
- **Choosing steps without considering their order:** later steps receive the output of earlier steps.
- **Preprocessing once before cross-validation:** when tuning, the recipe should be learned separately inside each analysis fold. Pass the untrained recipe in a workflow to the resampling procedure.

## Check your understanding

A test observation has ad spend of 70. Training ad spend has mean 50 and standard deviation 10. Which values should be used to normalize the test observation?

**Answer:** the training values: `(70 - 50) / 10 = 2`. The test set does not learn its own mean and standard deviation.

## Further reading

- [Recipes: introduction](https://recipes.tidymodels.org/articles/recipes.html)
- [Estimate a recipe with prep()](https://recipes.tidymodels.org/reference/prep.html)
- [Apply a recipe with bake()](https://recipes.tidymodels.org/reference/bake.html)
- [Fit a workflow](https://workflows.tidymodels.org/reference/fit-workflow.html)
