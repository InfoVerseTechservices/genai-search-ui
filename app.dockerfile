FROM node:20.18.0-slim AS builder

WORKDIR /home/colomboai

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY tsconfig.json next.config.mjs next-env.d.ts postcss.config.js drizzle.config.ts tailwind.config.ts ./
COPY src ./src
COPY public ./public

RUN mkdir -p /home/colomboai/data
RUN yarn build

RUN yarn add --dev @vercel/ncc
RUN yarn ncc build ./src/lib/db/migrate.ts -o migrator

FROM node:20.18.0-slim

WORKDIR /home/colomboai

COPY --from=builder /home/colomboai/public ./public
COPY --from=builder /home/colomboai/.next/static ./public/_next/static

COPY --from=builder /home/colomboai/.next/standalone ./
COPY --from=builder /home/colomboai/data ./data
COPY drizzle ./drizzle
COPY --from=builder /home/colomboai/migrator/build ./build
COPY --from=builder /home/colomboai/migrator/index.js ./migrate.js

RUN mkdir /home/colomboai/uploads

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
CMD ["./entrypoint.sh"]