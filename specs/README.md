# Specs

This project uses spec-driven development: decide what to build and why in writing, then build it.

| File                                 | Purpose                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| [`constitution.md`](constitution.md) | Non-negotiable principles for product and engineering                                        |
| [`product.md`](product.md)           | What the app does: audience, scope, pages, carving card, self-identification, admin workflow |
| [`architecture.md`](architecture.md) | How it is built: stack, architecture, data model, jobs, testing, risks                       |
| [`species.md`](species.md)           | Draft species list with launch waves (becomes the seed data)                                 |
| [`roadmap.md`](roadmap.md)           | Milestones in build order, with status                                                       |
| [`_template/`](_template/)           | Templates for a feature's `spec.md`, `plan.md` and `tasks.md`                                |
| `features/NN-name/`                  | One folder per milestone or feature, created from the template when work starts              |

## Flow per feature

1. **Spec:** copy `_template/` to `features/NN-name/` and fill in `spec.md`: the problem, requirements and acceptance criteria. Agree on it before coding.
2. **Plan:** fill in `plan.md`: the technical approach, files touched and open questions.
3. **Tasks:** break the plan into small, checkable steps in `tasks.md`.
4. **Build:** implement on a branch, ticking off tasks, with tests for every acceptance criterion.
5. **PR:** one PR per feature. Update `roadmap.md`, and any top-level spec the work changed.
