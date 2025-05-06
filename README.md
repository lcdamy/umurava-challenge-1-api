# umurava-challenge-1-api
## Description

This is an API for Challenge-1 for Umurava, written in TypeScript.

## Prerequisite installation 
 
 -nodejs v18.18.1
 -mongo v8.0.4

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/umurava-challenge-1-api.git
    cd umurava-challenge-1-api
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Running in Development Mode

To start the server in development mode, run:
```bash
npm run dev
```

## Building for Production

To build the project for production, run:
```bash
npm run build
```

## Setting Up Environment Variables

Create a `.env` file and add all the required environment variables by referring to the `.env.example` file.

To do this quickly, you can run:
```bash
cp .env.example .env
```

Make sure to update the `ADMIN_USER_EMAIL` variable in the `.env` file with a valid email address. This will be used to create a super admin account.

## Running Seeds

To run database migrations, use:
```bash
npm run seed:all
```

The built files will be in the `dist` directory.
