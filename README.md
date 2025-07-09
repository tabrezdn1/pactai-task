# EHR Resource Dashboard

This project is a modern dashboard for viewing and managing electronic health record (EHR) resources. It’s built with Next.js, shadcn/ui, and TanStack Table, and is designed to be both practical and easy to extend.

## What’s Inside?
- **Live, interactive table** of EHR resources (mock data, but easy to connect to a real API)
- **Search and sort** across all columns
- **Modern UI** with shadcn/ui components (cards, badges, tooltips, etc.)
- **Responsive and compact**—works great on desktop and mobile
- **Tooltips** for long text, so you never lose important info

## Why This Stack?
- **Next.js**: Fast, flexible, and easy to deploy. Great for React projects.
- **shadcn/ui**: Clean, accessible React components that look good out of the box.
- **TanStack Table**: The best way to build powerful, flexible tables in React.
- **TypeScript**: Type safety for fewer bugs and better code completion.

## Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the dev server:**
   ```bash
   npm run dev
   ```
3. **Open your browser:**
   Go to [http://localhost:3000](http://localhost:3000)

## How It Works
- The main page (`src/app/page.tsx`) shows summary cards and the resource table.
- The table (`src/components/ResourceTable.tsx`) uses TanStack Table for sorting and shadcn/ui for all UI elements.
- Data comes from a mock API (see `src/lib/api.ts`), but you can easily swap in your own endpoint.
- Searching is instant and works across all major fields.
- Long descriptions and AI summaries are truncated, but you can hover to see the full text.

## Customization
- Want to use your own data? Update the API URL in `src/lib/api.ts`.
- Need more columns or features? The table is easy to extend—just update the columns array.
- Want dark mode or more theming? shadcn/ui and Tailwind make it simple.

## File Structure (Key Parts)
```
src/
  app/
    page.tsx         # Main dashboard page
  components/
    ResourceTable.tsx # Table UI and logic
    ui/               # shadcn/ui components
  lib/
    api.ts           # Data fetching and transformation
  hooks/
    useResourceData.ts # Data fetching hook
  types/
    resource.ts      # TypeScript types
```

## Example Data
The mock data simulates real EHR resources: blood pressure readings, prescriptions, allergies, lab results, and more. Each row is a `ResourceWrapper` object, so you can plug in real data with the same shape.

## Want to Extend It?
- Add pagination or filtering
- Connect to a real backend
- Add authentication
- Build charts or analytics

## License
MIT

---

If you have questions or want to contribute, feel free to open an issue or PR. Enjoy building!
