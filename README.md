# e2e-playground

## Init React & Vite

cd frontend

### init

npm create vite@latest . -- --template react-ts

yarn
yarn dev

### common dependencies

yarn add -D sass

yarn add axios
yarn add react-router-dom

yarn add -D vitest @testing-library/react @testing-library/jest-dom jsdom

## Init Node & Nest

cd backend

### init

npx @nestjs/cli new .

-> sekect yarn

yarn start:dev

yarn add class-validator class-transformer

### prisma

yarn add -D prisma@6
yarn add @prisma/client@6
yarn prisma init --datasource-provider sqlite

-> add schema.prisma content

### init migration

yarn prisma migrate dev --name init

### seed

yarn add -D ts-node
yarn ts-node prisma/seed.ts

### create module

npx @nestjs/cli g module messages
npx @nestjs/cli g controller messages --no-spec
npx @nestjs/cli g service messages --no-spec
