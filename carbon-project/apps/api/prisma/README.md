# Prisma Schema Configuration

## Schema File

The Prisma schema is located at `schema-new.prisma`, which is a symlink to the root schema:
```
schema-new.prisma -> ../../prisma/schema.prisma
```

## Why schema-new.prisma?

This file was created due to a naming conflict. All Prisma commands in `package.json` are configured to use `schema-new.prisma` via the `--schema` flag.

## Usage

All Prisma commands automatically use `schema-new.prisma`:

```bash
pnpm prisma:generate    # Generate Prisma Client
pnpm prisma:migrate     # Run migrations
pnpm prisma:studio      # Open Prisma Studio
```

Or from the root:
```bash
pnpm db:generate
pnpm db:migrate
```

