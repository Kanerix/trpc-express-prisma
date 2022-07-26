# TRPC + Express + Prisma example

This is an example on how to use TRPC, Express and Prisma together.

This project was done for learning and is not an official example.

## Get started 

1. Install yarn if not already installed.

2. Install dependencies through `yarn`.

3. Fill out an `.env` file following the `.env.example`
    1. If you wan't a quick databse you can run `docker-compose up -d`
    2. The databse url will then be `postgresql://postgres:password@localhost:5432/`

4. Run `yarn prisma migrate dev` and `yarn prisma generate`.

5. Start the server using the `start` script defined in package.json.

