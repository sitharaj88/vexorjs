# ORM relations example

Demonstrates `hasMany`, `belongsTo`, and `belongsToMany` with eager loading.

```bash
npx tsx examples/orm-relations/index.ts
```

Each `loadRelations()` call issues **one** IN-query per relation across all
parent rows — never one query per parent.
