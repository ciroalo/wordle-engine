# ADR-004: Vite as Build Tool

> **Project Name:** wordle-engine  
> **Project Manager:** @ciroalo  
> **Last Revision Date:** April 9, 2026  
> **Version:**  0.1.0  
> **Status:** Accepted

## Context

Need a buld tool that handles TypeScript, React, CSS modules, and produces tiny
static bundles

## Decision

Vite

## Rationale

- near-zero configuration for TS + React projects

- extremely fast dev server (native ES modules)

- excellent production build output (rollup-based, tree-shaking)

- first-class TypeScript and CSS Modules support

- de facto standard for new React projects

## Consequences

- it must be used with Node.js 18+ for development

- dev server uses ES modules, which means occasional differences between dev and 
production behavior (rare)