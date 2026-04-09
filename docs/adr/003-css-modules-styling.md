# ADR-003: CSS Modules for Styling

> **Project Name:** wordle-engine  
> **Project Manager:** @ciroalo  
> **Last Revision Date:** April 9, 2026  
> **Version:**  0.1.0  
> **Status:** Accepted

## Context

Need scoped, maintainable styling with zero runtime cost.  
Options: CSS Modules, Tailwind, styled-components, Emotion, plain CSS

## Decision

CSS Modules

## Rationales

- zero runtime overhead (styles compiled at build time)

- natural scoping prevents style conflicts

- no learning curve beyond standard css

- theming via CSS custom properties (set from config at startup)

## Consequences

- no utility-class convenience (must write more CSS)

- theming requires manual CSS custom property management

- acceptable tradeoff for bundle size and simplicity