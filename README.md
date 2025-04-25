# Data Table Filters

A powerful and flexible data table solution for React applications with advanced filtering capabilities.

## About The Project

This is a standalone data-table demo that showcases advanced filtering, sorting, and visualization capabilities. The project demonstrates different approaches to data tables:

- [Data table with simple pagination](https://data-table.openstatus.dev/default) (client-side)
- [Data table with infinite scroll and click details](https://data-table.openstatus.dev/infinite) (server-side)
- [OpenStatus Light Viewer](https://data-table.openstatus.dev/light) - A practical implementation example

![Data Table with Infinite Scroll](https://data-table.openstatus.dev/assets/data-table-infinite.png)

Visit [data-table.openstatus.dev](https://data-table.openstatus.dev) to see live examples.

## Features

- **Advanced Filtering**: Powerful filtering capabilities with intuitive UI
- **Multiple Table Styles**: Support for pagination and infinite scroll
- **Responsive Design**: Works on various screen sizes
- **Customizable**: Easily adapt to different use cases
- **Interactive UI**: Modern interface with hover states and detailed views

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [TanStack Query](https://tanstack.com/query/latest) - Data fetching and caching
- [TanStack Table](https://tanstack.com/table/latest) - Headless table library
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [cmdk](http://cmdk.paco.me) - Command menu component
- [nuqs](http://nuqs.47ng.com) - URL search params management
- [dnd-kit](https://dndkit.com) - Drag and drop functionality

## Getting Started

No environment variables are required to run this project locally.

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser

## Project Structure

```
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── default/        # Simple pagination example
│   │   ├── infinite/       # Infinite scroll example
│   │   ├── light/          # Light viewer example
│   │   └── guide/          # Documentation
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── providers/          # React context providers
│   └── styles/             # Global styles
└── public/                 # Static assets
```

## Examples

### Default Table (Client-side Pagination)

A simple table implementation with client-side pagination and filtering.

### Infinite Table (Server-side)

Advanced table with infinite scrolling, server-side filtering, and detailed view on click.

### Light Viewer

A practical implementation showing how the table can be used in a real-world application.

## Documentation

The [Guide](https://data-table.openstatus.dev/guide) section provides detailed documentation on how to use and customize the data tables for your own projects.
