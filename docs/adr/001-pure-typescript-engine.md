# ADR-001: Pure TypeScript Engine Layer

> **Project Name:** wordle-engine  
> **Project Manager:** @ciroalo  
> **Last Revision Date:** April 9, 2026  
> **Version:**  0.1.0  
> **Status:** Accepted

## Context 

The game logic (feedback, filtering, normalization, round manegement) is the core intellectual property
of this project. We need it to be testable, maintainable, and potentially reusable.

## Decision

All game logic lives in `src/engine/` as pure TypeScript functions with zero framework dependencies. 
No React, no DOM, no browser APIs.

## Consequences

- Engine functions are trivially testable (pure input -> output)

- Engine could theoretically be reused with a different UI framework

- Enforces separation of concerns
