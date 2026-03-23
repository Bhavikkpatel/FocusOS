# Contributing to FocusOS

Welcome to FocusOS, and thank you for taking the time to contribute! FocusOS is an open-source productivity system built around the "FlowState" philosophy.

This document outlines the guidelines for contributing to FocusOS, encompassing both technical and design principles.

## The Anti-Gravity Philosophy

FocusOS is designed to reduce cognitive friction and promote **Execution over Planning**. Before you push any code or propose a new feature, ask yourself:

- Does this reduce clicks for the user?
- Does this reduce visual clutter?
- Will this pull the user out of their "Zone"?

## Design Guardrails

To maintain the minimalist aesthetic, any UI contributions must adhere exactly to the "Design Guardrails":

1. **No new borders without approval.** We use whitespace, opacity, and positioning to define hierarchy, not bounding boxes.
2. **Typography is strict.** All textual content uses `Inter` (or the system sans-serif equivalent). All numerical data, metrics, and timers **must** be rendered in `JetBrains Mono`.
3. **Ghost UI.** Secondary actions and metadata should remain low opacity or completely hidden until hovered/focused. The interface must "get out of the way" when the user is inactive.
4. **Vibrant Accents, Dark Backgrounds.** Maintain our curated harmonious colors. Avoid generic primary colors (e.g., standard red/blue/green) in favor of high-contrast, polished shades with subtle micro-animations for interactivity.

## Branching Strategy

To keep our repository clean, please adhere to the following workflow:

1. **`main`**: The stable branch. Contains production-ready code.
2. **`develop`**: The integration branch. All feature branches must target `develop`.

### Pull Request Workflow

1. **Fork the repo** and create your branch from `develop`.
2. Prefix your branch name with `feature/`, `bugfix/`, or `docs/` (e.g., `feature/custom-timers`).
3. Make your changes in a concise, logical series of commits.
4. Run tests and linting locally (`npm run lint`, `npm run build`).
5. Ensure your code complies with the Design Guardrails before opening a Pull Request.
6. Submit your PR targeting the `develop` branch. If fixing an issue, include "Fixes #issue_number" in the PR description.

## Code Standards

- **TypeScript:** We strictly enforce TypeScript. Aim to minimize `any` usage.
- **Styling:** We use Tailwind CSS. Rely on our predefined class utilities and design tokens.
- **Formatting:** Prettier will format your code automatically; ensure it is run prior to committing.

Thank you for contributing to FocusOS!
