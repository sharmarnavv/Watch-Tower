# Watch Tower


A web3-based uptime monitoring system built with TypeScript, Next.js, and Bun.

# Decentralized Uptime Monitoring Platform

This document outlines the core concepts, vision, and challenges behind building a **decentralized uptime monitoring platform**, inspired by services like Better Uptime but leveraging the power of Web3 technologies, specifically **DePIN (Decentralized Physical Infrastructure Networks)**.

----------

## What is Uptime Monitoring?

**Uptime monitoring platforms** track the availability of websites, APIs, and other online services. If a service goes down, the platform detects it and promptly notifies developers or system administrators, enabling quick resolution. Traditional (Web2) platforms typically involve signing up, creating a monitor for a specific URL, and selecting notification methods like email, calls, or SMS.

----------

## The Problem with Centralized Monitoring

Current centralized monitoring solutions often operate from a limited number of data centers or regions (e.g., North America, Australia). While effective for general uptime, this approach has limitations:

-   **Limited Visibility:** It cannot accurately gauge accessibility from every specific global location, such as a remote village.
    
-   **Centralized Points of Failure:** Reliance on a few data centers means the monitoring itself can be affected by regional outages.
    

----------

## Introducing DePIN (Decentralized Physical Infrastructure Networks)

**DePIN** offers a revolutionary alternative. It allows individuals worldwide with a machine and internet access to become "validators" within a network. These validators contribute their idle compute and network resources to perform tasks, such as constantly pinging websites for uptime.

### Benefits of Using DePIN for Uptime Monitoring:

-   **Granular Visibility:** Measure platform accessibility from hundreds of diverse, even remote, locations globally.
    
-   **Incentives for Validators:** Participants earn cryptocurrency for contributing their resources and monitoring websites, fostering a robust and distributed network.
    
-   **Enhanced Reliability:** Distributes monitoring across a vast network, reducing single points of failure.
    
-   **Comprehensive Data:** Provides more detailed and geographically diverse uptime data.
    

### DePIN Examples:

-   **Helium Network:** A decentralized Wi-Fi network where individuals host routers and earn tokens for providing connectivity.
    
-   **Huddle:** A decentralized WebRTC platform where validators assist in transferring video data, reducing reliance on centralized cloud services.
    

----------

## The Project: Decentralized Better Uptime

The goal is to build a decentralized version of Better Uptime. In this platform:

-   Users register their websites for monitoring.
    
-   A global network of **validators** continuously checks and reports the health and uptime status of these websites.
    

----------

## Key Challenges in Building a Decentralized Uptime Platform

Developing such a platform involves addressing several complex challenges:

-   **Crypto Withdrawals:** Implementing a secure and efficient system for validators to receive their cryptocurrency payments.
    
-   **Validator Honesty:** Designing mechanisms to ensure validators report accurate uptime status and prevent fraudulent or dishonest reporting.
    
-   **Incentive Mechanisms:** Creating robust systems that encourage honest participation and disincentivize malicious actions.
    
-   **Fair Payments:** Ensuring validators are compensated accurately and fairly for their contributed work.
    
-   **Security:** Protecting against vulnerabilities like double withdrawals and other potential exploits.
    

----------

## Core Functionality

Despite the underlying Web3 complexities, the core of this project will be a **full-stack platform** where users can easily create, manage, and view the status of their website monitors, similar to how traditional uptime services operate.# Decentralized Uptime Monitoring Platform

This document outlines the core concepts, vision, and challenges behind building a **decentralized uptime monitoring platform**, inspired by services like Better Uptime but leveraging the power of Web3 technologies, specifically **DePIN (Decentralized Physical Infrastructure Networks)**.

----------

## What is Uptime Monitoring?

**Uptime monitoring platforms** track the availability of websites, APIs, and other online services. If a service goes down, the platform detects it and promptly notifies developers or system administrators, enabling quick resolution. Traditional (Web2) platforms typically involve signing up, creating a monitor for a specific URL, and selecting notification methods like email, calls, or SMS.

----------

## The Problem with Centralized Monitoring

Current centralized monitoring solutions often operate from a limited number of data centers or regions (e.g., North America, Australia). While effective for general uptime, this approach has limitations:

-   **Limited Visibility:** It cannot accurately gauge accessibility from every specific global location, such as a remote village.
    
-   **Centralized Points of Failure:** Reliance on a few data centers means the monitoring itself can be affected by regional outages.
    

----------

## Introducing DePIN (Decentralized Physical Infrastructure Networks)

**DePIN** offers a revolutionary alternative. It allows individuals worldwide with a machine and internet access to become "validators" within a network. These validators contribute their idle compute and network resources to perform tasks, such as constantly pinging websites for uptime.

### Benefits of Using DePIN for Uptime Monitoring:

-   **Granular Visibility:** Measure platform accessibility from hundreds of diverse, even remote, locations globally.
    
-   **Incentives for Validators:** Participants earn cryptocurrency for contributing their resources and monitoring websites, fostering a robust and distributed network.
    
-   **Enhanced Reliability:** Distributes monitoring across a vast network, reducing single points of failure.
    
-   **Comprehensive Data:** Provides more detailed and geographically diverse uptime data.
    

### DePIN Examples:

-   **Helium Network:** A decentralized Wi-Fi network where individuals host routers and earn tokens for providing connectivity.
    
-   **Huddle:** A decentralized WebRTC platform where validators assist in transferring video data, reducing reliance on centralized cloud services.
    

----------

## The Project: Decentralized Better Uptime

The goal is to build a decentralized version of Better Uptime. In this platform:

-   Users register their websites for monitoring.
    
-   A global network of **validators** continuously checks and reports the health and uptime status of these websites.
    

----------

## Key Challenges in Building a Decentralized Uptime Platform

Developing such a platform involves addressing several complex challenges:

-   **Crypto Withdrawals:** Implementing a secure and efficient system for validators to receive their cryptocurrency payments.
    
-   **Validator Honesty:** Designing mechanisms to ensure validators report accurate uptime status and prevent fraudulent or dishonest reporting.
    
-   **Incentive Mechanisms:** Creating robust systems that encourage honest participation and disincentivize malicious actions.
    
-   **Fair Payments:** Ensuring validators are compensated accurately and fairly for their contributed work.
    
-   **Security:** Protecting against vulnerabilities like double withdrawals and other potential exploits.
    

----------

## Core Functionality

Despite the underlying Web3 complexities, the core of this project will be a **full-stack platform** where users can easily create, manage, and view the status of their website monitors, similar to how traditional uptime services operate.



## Project Structure

```
├── apps/
│   ├── api/         # Backend API
│   ├── frontend/    # Next.js frontend
│   ├── hub/         # Hub service
│   ├── validator/   # Validator service
│   └── web/         # Web interface
├── packages/
│   └── db/         # Shared database package
```

## Prerequisites

- Node.js >= 18
- Bun >= 1.2.7
- Docker & Docker Compose
- PostgreSQL

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd uptime-web3
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development environment:
   ```bash
   docker-compose up -d
   bun run dev
   ```

## Development

- `bun run dev`: Start development servers
- `bun run build`: Build all packages
- `bun run lint`: Run linting
- `bun run check-types`: Type checking