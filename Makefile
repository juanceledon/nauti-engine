.PHONY: run serve test deploy docker-build docker-up

# All local targets load .env (OPENAI_API_KEY) — the opencode binary does not auto-load it
define load_env
	@test -f .env || { echo "Missing .env — create it with OPENAI_API_KEY=sk-..."; exit 1; }
endef

# Chat with Nauti Builder in the terminal (TUI)
run:
	$(load_env)
	set -a; . ./.env; set +a; opencode

# HTTP server (OpenCode sessions API)
serve:
	$(load_env)
	set -a; . ./.env; set +a; opencode serve --port 4096 --hostname 0.0.0.0

test:
	node --test tests/composer.test.ts

docker-build:
	docker build -t nauti-engine .

docker-up:
	docker compose up --build

deploy:
	fly deploy
