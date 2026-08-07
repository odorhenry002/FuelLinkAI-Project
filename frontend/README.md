# Frontend README

## FuelLink AI Frontend

Next.js 14 + React 18 + TypeScript + Tailwind CSS

### Project Structure

```
src/
├── app/              # Next.js App Router (Pages & Layouts)
├── components/       # Reusable React Components
├── hooks/            # Custom React Hooks
├── lib/              # Utilities & API Clients
├── styles/           # Global CSS & Tailwind
└── types/            # TypeScript Type Definitions
```

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Architecture

- **Clean Architecture** - Separation of concerns
- **Component-Driven** - Reusable components
- **Type-Safe** - Full TypeScript support
- **API Integration** - Axios with interceptors
- **State Management** - Zustand (minimal) + React Query

### Key Features

- ✅ Responsive Design
- ✅ Dark Mode Support (Coming Soon)
- ✅ Authentication Flow
- ✅ API Integration
- ✅ Form Validation with Zod
- ✅ Error Handling
- ✅ Loading States

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Deployment

Ready for deployment on:
- Vercel (recommended)
- AWS
- Docker
