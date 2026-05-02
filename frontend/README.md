# ProGyan AlgoLens - Frontend

Next.js 14 frontend application for the ProGyan AlgoLens platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Code Editor**: Monaco Editor
- **Visualization**: D3.js, React Flow
- **Animation**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── editor/            # Code editor components
│   ├── visualization/     # Visualization components
│   ├── ai-explanation/    # AI explanation components
│   ├── layout/            # Layout components
│   └── shared/            # Shared components
├── lib/
│   ├── api/               # API client
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand stores
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
└── styles/                # Global styles
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_ENV=development
```

## Key Features

- **Code Editor**: Monaco-based editor with syntax highlighting
- **Real-time Visualization**: D3.js visualizations of execution state
- **AI Explanations**: Context-aware explanations from AI service
- **WebSocket**: Real-time updates during code execution
- **Algorithm Persistence**: Save custom algorithms to personal cloud library
- **Real-time Collaboration**: Share workspaces with other users (view/edit)
- **Responsive**: Mobile-friendly design
- **Accessible**: WCAG 2.1 AA compliant

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT