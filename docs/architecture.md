# Architecture overview

DR. NEXUS is a monorepo with independently deployable frontend and backend applications.

```text
React + Vite browser client
  ├─ IndexedDB (future offline cache)
  └─ FastAPI REST API
       ├─ Supabase PostgreSQL / Auth / Storage
       └─ future validated AI inference interfaces
```

The browser may use Supabase Authentication and Storage through its restricted public key where appropriate. Privileged database and service-role operations belong only in the API. The AI package remains separate from request routing so model development can be versioned, reviewed, and deployed deliberately.

No medical decision, diagnostic, or prediction feature exists in this foundation.
