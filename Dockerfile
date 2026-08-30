FROM node:22-slim

RUN npm install -g opencode-ai@1.1.65

WORKDIR /app
COPY . .

# /data is the persistent volume: opencode session storage (XDG_DATA_HOME) + generated prompts
ENV XDG_DATA_HOME=/data
RUN rm -rf /app/generated && ln -s /data/generated /app/generated

EXPOSE 4096
CMD ["sh", "-c", "mkdir -p /data/generated && exec opencode serve --port 4096 --hostname 0.0.0.0"]
