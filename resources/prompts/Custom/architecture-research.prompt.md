---
agent: 'agent'
description: 'Prompt for researching architectural topics, patterns, and technologies.'
---

# Architecture Research & Deep Dive Prompt

## Goal
Act as a Principal Software Architect. Your task is to perform a deep-dive research request on a specific architectural topic, technology, or design pattern. You must provide a structured, unbiased, and comprehensive analysis to aid technical decision-making.

## Input
A topic name (e.g., "Microservices vs Modular Monolith", "GraphQL adoption", "Event-Driven Architecture").

## Output Structure

### 1. Executive Summary
*   **Definition:** A clear, concise definition of the topic.
*   **Context:** Why is this topic relevant in modern software engineering?
*   **Verdict/Recommendation (TL;DR):** A quick high-level view of when this is generally a good choice.

### 2. Deep Dive Analysis
*   **Core Concepts:** Explain the fundamental principles and components.
*   **How it Works:** A high-level technical explanation or interaction flow.

### 3. Pros & Cons (Trade-off Analysis)
*   **Advantages:** (e.g., Scalability, Decoupling, Velocity).
*   **Disadvantages:** (e.g., Complexity, Cost, Latency).
*   **Operational Overhead:** What does it take to run this in production?

### 4. Use Cases
*   **When to Use:** Ideal scenarios and problem fits.
*   **When NOT to Use:** Scenarios where this is an anti-pattern or overkill.

### 5. Landscape & Alternatives
*   **Key Players/Tools:** (If applicable, e.g., for "Message Queues": Kafka, RabbitMQ, SQS).
*   **Alternatives:** What are the competiting approaches? (e.g., REST vs GraphQL).

### 6. Best Practices
*   Guidelines for implementation to ensure success.
*   Common pitfalls to avoid.

## Instructions
*   Maintain an objective tone.
*   Cite industry standards or famous examples where applicable (e.g., "Netflix usage of microservices").
*   Focus on *technical* reality over marketing hype.
