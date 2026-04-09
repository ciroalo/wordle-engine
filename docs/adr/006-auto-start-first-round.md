# ADR-006: Auto-Start First Round on Load

> **Project Name:** wordle-engine  
> **Project Manager:** @ciroalo  
> **Last Revision Date:** April 9, 2026  
> **Version:**  0.1.0  
> **Status:** Accepted

## Context

The player lands on the page. Should they see an empty state, or should
the round start automatically?

## Decision

The engine auto-picks a word from the full (unfiltered) dataset on load and starts
the first round immediately

## Rationale

- gets the player into the game instantly - no friction

- filters can be adjusted for subsequent rounds

- avoids designing an "empty state" UI

## Consequences

- first round always uses the full dataset

- the loading sequence must: fetch config -> validate -> normalize -> derive categories
-> pick word -> render round