# ADR-005: In-Memory Session State Only

> **Project Name:** wordle-engine  
> **Project Manager:** @ciroalo  
> **Last Revision Date:** April 9, 2026  
> **Version:**  0.1.0  
> **Status:** Accepted

## Context

We need to track played words with a session.  
Options: in-memory (reset at refresh), localStorage (persist across refreshes) or 
sessionStorage

## Decision

In-memory only. A javascript set that lives in the react state

## Rationale

- requirements explicitly states in-memory only

- simples possible implementation

- no browser storage API compatibility concerns

- clean slate on every page load is acceptable for V1

## Consequences

- refreshing the page resets al progress and allows replaying words

- future version could add persistence if needed