FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install



COPY . .

# prisma generate reads prisma.config.ts, which requires DATABASE_URL even though
# it does not connect to the DB. Use a placeholder at build time; pass the real
# URL when running the container (e.g. docker run -e DATABASE_URL=...).
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]