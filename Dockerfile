FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Definimos los args
ARG NEXT_PUBLIC_API_APP_CITAS_URL
ARG NEXT_PUBLIC_HOSPITAL_NAME
ARG NEXT_PUBLIC_HOSPITAL_ADDRESS
ARG NEXT_PUBLIC_HOSPITAL_LOCATION
ARG NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS

# Los exportamos como env para que los tome Next.js en build
ENV NEXT_PUBLIC_API_APP_CITAS_URL=$NEXT_PUBLIC_API_APP_CITAS_URL
ENV NEXT_PUBLIC_HOSPITAL_NAME=$NEXT_PUBLIC_HOSPITAL_NAME
ENV NEXT_PUBLIC_HOSPITAL_ADDRESS=$NEXT_PUBLIC_HOSPITAL_ADDRESS
ENV NEXT_PUBLIC_HOSPITAL_LOCATION=$NEXT_PUBLIC_HOSPITAL_LOCATION
ENV NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS=$NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER nextjs
CMD ["npm", "start"]