# ADR-002: React Context + useReducer for State Management

> **Project Name:** wordle-engine  
> **Project Manager:** @ciroalo  
> **Last Revision Date:** April 9, 2026  
> **Version:**  0.1.0  
> **Status:** Accepted

## Context

The apps needs centralized state (round state, filters, session tracking)  
Options: Redux, Zustand, MobX, Jotai, or built-in React Context.

## Decision

Use React Context with useReducer. The reducer calls engine functions to compute new state.

## Rationale

- Game state is well-bounded and predictable (finite actions, deterministic transitions)

- No external dependency

- useReducer maps naturally to the action-based game loop

- The app has a single screen with moderate state complexity - Context won't cause performance
issues at this scale

## Consequences

- If state grows significantly in future versions, we may need to split into multiple contexts
or consider an external library.

- All state transitions are explicit and traceable through action types

