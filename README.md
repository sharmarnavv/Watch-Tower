# Uptime Web3

A web3-based uptime monitoring system built with TypeScript, Next.js, and Bun.

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

## License

[Your chosen license]

