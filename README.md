# [Tonychat](https://tony-chat-nine.vercel.app/)

**TonyChat is a open-source multifunctional Chatbot, which you can use for your personal and business purpose safely. It supports customized chatbot deploy, easy fine tuning your models, safety and privacy. The platform is designed to make it easy for anyone to find, share, and use prompts to develop AI applications.**

## Features

![Homepage](public/image.png)

- **Custom AI Agents:** Create, customize, and deploy AI chatbots tailored for your needs.
- **Workflow Automation:** Build conversations and automation flows using an intuitive visual or code interface.
- **Multi-Model Support:** Integrate with a variety of large language models and tools.
- **Community Sharing:** Discover and use bots, prompts, and workflows shared by others.
- **Extensions & Plugins:** Expand TonyChat’s capabilities with APIs, plugins, and integration hooks.

## Use Cases

- Personal AI Assistants
- Customer Support Bots
- Educational Tutors/Helpers
- Work Automation & Scheduling
- Creative Companions
- Experimentation with new LLM features and agents


## Highlights

- Multi-provider LLM integrations (OpenAI, Google Generative, Anthropic, Azure)
- Retrieval-Augmented Generation (RAG) microservice (FastAPI + LangChain)
- Next.js (App Router) + TypeScript + Tailwind CSS frontend
- Optional Supabase integration for storage and auth

## Quick start (local)

Prerequisites

- Node.js (v18+ recommended)
- Python 3.10+ for the RAG microservice (optional)
- pip for Python packages

1) Install frontend dependencies

```bash
npm install
```

2) Create environment variables

Create a `.env.local` in the project root. Example variables used by this project include:

```env
# Next.js / frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001

# LLM / API keys (examples — provide only the ones you use)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=your-google-gen-api-key
ANTHROPIC_API_KEY=your-anthropic-key
AZURE_OPENAI_API_KEY=your-azure-key
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://your-azure-endpoint

# Optional / misc
NEXT_PUBLIC_VERCEL_ENV=development
GITHUB_TOKEN=ghp_...
```

Note: the project declares many environment variables in `config/server.ts`; only set the keys you need for your chosen providers.

3) Start the Next.js dev server

```bash
npm run dev
# open http://localhost:3000
```

4) (Optional) Start the RAG microservice

The repo includes a Python RAG microservice at `backend/rag_service.py`. It loads content from `docs/tech` and exposes a `/rag/query` endpoint used by the frontend.

```bash
# create a venv (recommended)
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # or: pip install fastapi uvicorn langchain openai faiss-cpu
uvicorn backend.rag_service:app --reload --port 8001
```

The frontend expects the RAG endpoint at `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8001`).

## Project structure (high level)

- `app/` — Next.js frontend (App Router) and API routes. Key folders:
  - `app/api/chat/` — built-in chat provider routes (openai, google, repo, etc.)
  - `app/chat/` — UI pages/components for chat and agent management
- `backend/` — RAG microservice (FastAPI) and tests
- `lib/` — helper clients (e.g. `lib/supabase.ts`)
- `config/` — server config and environment declarations

## Environment variables used by the app

Key environment variables referenced in the codebase include (not exhaustive):

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `OPENAI_API_KEY` — OpenAI API key
- `GEMINI_API_KEY` — Google Generative API key
- `ANTHROPIC_API_KEY` — Anthropic API key
- `AZURE_OPENAI_API_KEY` — Azure OpenAI key
- `NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT` — Azure OpenAI endpoint
- `NEXT_PUBLIC_BACKEND_URL` — URL of the RAG or backend API

See `config/server.ts` for the full list of declared environment variables and where they map into server config.

## Scripts

From `package.json`:

- `npm run dev` — run Next.js in development mode
- `npm run build` — build for production
- `npm run start` — start the production server
- `npm run lint` — run ESLint

## RAG & knowledge base

- Knowledge docs live under `docs/tech`. Edit or add files there to expand your domain knowledge.
- The RAG microservice in `backend/rag_service.py` loads `docs/tech` (or other configured sources) and exposes endpoints the frontend can call.
- There are test helpers in `backend/test_rag_api.py` and `backend/test_rag_curl.sh` to exercise the RAG endpoints.

## Deploying

- Vercel is a great option for deploying the Next.js frontend. Configure environment variables in your Vercel project settings.
- If you deploy the RAG service, host it separately (e.g., a VM, Docker container, or serverless function) and point `NEXT_PUBLIC_BACKEND_URL` at it.

## Contributing

Contributions are welcome. A few suggestions:

- Open an issue to discuss new features or bugs.
