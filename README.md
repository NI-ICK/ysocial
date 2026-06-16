# YSocial

YSocial is a full-stack social media platform that enables users to create content, connect with others, and engage through posts, comments, likes, and follows.

A live demo is available via the link in the About section.

## Features

- User authentication with OAuth 2.0 and JWT
- Create, edit, delete, and manage posts
- Create and interact with comments
- Like posts and comments
- Follow and unfollow users
- User profile management
- Responsive and modern user interface

## Tech Stack

#### Client

- Angular
- TypeScript
- Apollo Client
- NgRx

#### Server

- NestJS
- TypeScript
- Apollo Server
- GraphQL
- TypeORM

#### Database

- PostgreSQL

#### Authentication

- OAuth 2.0
- JWT

#### File Storage

- Cloudinary

## How to run

### 1. Install dependencies

#### Client

```
cd client/
npm install
```

#### Server

```
cd server/
npm install
```

### 2. Run the Application

#### Client

```
cd client/
npm run start
```

#### Server

```
cd server/
npm run start
```

## Environment Variables

Both the `client` and `server` require environment variables to run correctly.

Example environment configuration files are provided in the project:

- `client/.env.example`
- `server/.env.example`

Refer to the `.env.example` files for a complete list of required environment variables and their descriptions.

## Testing

The project includes comprehensive automated test coverage for both the `client` and `server`:

- Client: 360+ tests
- Server: 150+ tests

To run tests, navigate to either the `client` or `server` directory and execute:

```
npm run test
```
