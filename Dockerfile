# Utiliser l'image officielle Node.js
FROM node:18-alpine AS base

# Installer les dépendances seulement quand nécessaire
FROM base AS deps
# Vérifier https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine pour comprendre pourquoi libc6-compat pourrait être nécessaire.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installer les dépendances basées sur le gestionnaire de paquets préféré
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuilder le code source seulement quand nécessaire
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collecte des données de télémétrie complètement anonymes sur l'utilisation générale.
# En savoir plus ici : https://nextjs.org/telemetry
# Décommenter la ligne suivante si vous voulez désactiver la télémétrie pendant la build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Image de production, copier tous les fichiers et exécuter next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Décommenter la ligne suivante si vous voulez désactiver la télémétrie pendant l'exécution.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Utiliser le répertoire de sortie correct pour les traces
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Commande pour démarrer l'application
CMD ["node", "server.js"]
