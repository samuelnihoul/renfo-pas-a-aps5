# Program and Routine Implementation

## Overview
This document explains how the application implements the fact that programs are divided into routines.

## Database Schema

### Programs Table
The `programs` table represents training programs in the application. Each program can contain multiple routines (training days).

```typescript
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  duration: varchar("duration", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})
```

### Routines Table
The `routines` table represents individual training days within a program. Each routine belongs to a specific program and has a day number to indicate its order within the program.

```typescript
export const routines = pgTable(
  "routines",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    focus: varchar("focus", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      programDayUnique: unique().on(table.programId, table.dayNumber),
    }
  },
)
```

## Relationships

### Programs to Routines
The relationship between programs and routines is defined as a one-to-many relationship. A program can have many routines, but each routine belongs to exactly one program.

```typescript
export const programsRelations = relations(programs, ({ many }) => ({
  routines: many(routines),
}))
```

### Routines to Programs
The relationship from routines to programs is defined as a many-to-one relationship. Many routines can belong to a single program.

```typescript
export const routinesRelations = relations(routines, ({ one, many }) => ({
  program: one(programs, {
    fields: [routines.programId],
    references: [programs.id],
  }),
  // other relations...
}))
```

## Implementation Details

1. **Foreign Key Constraint**: The `routines` table has a foreign key constraint on the `programId` field that references the `id` field of the `programs` table. This ensures that each routine is associated with a valid program.

2. **Cascade Delete**: The foreign key constraint includes a `cascade` option for deletion, which means that if a program is deleted, all its associated routines will be automatically deleted as well.

3. **Unique Constraint**: The `routines` table has a unique constraint on the combination of `programId` and `dayNumber`, ensuring that each day number is unique within a program.

4. **Bidirectional Relations**: The relations are defined in both directions (programs to routines and routines to programs), allowing for efficient querying in either direction.

## API Implementation

The API endpoints for programs and routines reflect this relationship:

1. **GET /api/programs**: Returns a list of all programs, each with its associated routines.
2. **GET /api/programs/:id**: Returns a specific program with its routines.
3. **GET /api/programs/:id/days/:dayId/exercises**: Returns the exercises for a specific routine within a program.

This implementation ensures that the application correctly represents the fact that programs are divided into routines, with each routine representing a day of training within the program.