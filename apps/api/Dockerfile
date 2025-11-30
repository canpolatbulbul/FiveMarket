# apps/api/Dockerfile
FROM node:22-alpine
WORKDIR /app
# 1) copy root manifests (includes the root lockfile)
COPY package.json package-lock.json ./
# 2) copy api package.json so npm knows about that workspace
COPY apps/api/package.json apps/api/package.json
# 3) install only the api workspace deps using the root lockfile
RUN npm ci --workspace apps/api
# 4) copy the rest of the monorepo pieces the api needs
COPY db ./db
COPY apps/api ./apps/api
# 5) run migrations then start api
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["sh","-c","node /app/db/scripts/migrate.js && npm run start"]