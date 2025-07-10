# EHR Resource Dashboard

A simple, fast dashboard for browsing electronic-health-record (EHR) resources. Built with **Next.js 15**, **TypeScript**, and a handful of small, modern libraries.

---

## What’s new?

* **Large-data support** – the table can show **up to 1 million rows** thanks to virtual scrolling.
* **Real progress bar** – a tiny `ProgressBar` component tells you how much of the data has loaded.
* **Status badges** – every resource shows a clear state: *Completed*, *Processing*, *Failed*, or *Not Started*.
* **Mock API route** – `GET /api/resources?count=123` returns fake but realistic data so you can test right away.
* **Full test suite** – Jest + React Testing-Library cover the table, the progress bar, and key edge cases (over 60 % coverage).
* **One-command CI build** – `npm run test:ci` runs the tests with `NODE_ENV=test` so it works both locally and on Vercel.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Start the dev server
npm run dev

# 3. Open your browser
http://localhost:3000
```

---

## Main features

| Feature | Where to look |
|---------|---------------|
| Interactive table (sort, search, paginate) | `src/components/ResourceTable.tsx` |
| Progress bar while loading | `src/components/ui/progress.tsx` |
| Mock data + API route | `src/lib/api.ts`, `src/app/api/resources/route.ts` |
| Strong types for every field | `src/types/resource.ts` |
| Unit tests | `src/__tests__/` |

---

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Next.js in development mode |
| `npm run test` | Run tests once (sets `NODE_ENV=test`) |
| `npm run test:watch` | Watch mode |
| `npm run test:ci` | Tests + coverage, used in CI |
| `npm run build` | Run tests first, then create the production build |

---

## Folder map (short version)

```text
src/
  app/
    page.tsx            – dashboard page
    api/resources/      – mock REST endpoint
  components/
    ResourceTable.tsx   – the big table
    ui/                 – small reusable UI parts
  data/                 – sample data used in storybook/tests
  hooks/                – custom React hooks
  lib/                  – api helpers & utilities
  types/                – TypeScript models
  __tests__/            – Jest tests
```

---

## Customising

1. **Use real data** – replace the fetch in `src/lib/api.ts` with your endpoint.
2. **Change columns** – edit the `columns` array inside `ResourceTable.tsx`.
3. **Restyle** – components come from shadcn/ui + Tailwind, so you can tweak classes freely.

---

## License

MIT – do whatever you like.

---

*Have fun building!*
