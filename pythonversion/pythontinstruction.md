This is the Python/Flask + LangGraph port of the original lab (Get things done and solve real problems with GenAI_v1.md).

What’s the same
- Same folder structure and checkpoints: `src`, `part1`, `part2` (rooted under `pythonversion/`).
- Same frontend: HTML/CSS/JS are unchanged; API paths are identical.
- Same features per checkpoint:
  - `src`: basic coffee API + order processing stub.
  - `part1`: LangGraph generates a short personalized coffee message.
  - `part2`: Adds a simple image-scan graph (Watsonx vision) example in addition to the message graph.

What changed (TypeScript → Python)
- Server: Express → Flask.
- Graphs: `@langchain/langgraph` → `langgraph` (Python).
- LLM: Watsonx integration via simple `requests` calls with an offline fallback (no keys required to run the lab).
- Config: `package.json` → `pythonversion/requirement.txt` for Python deps.

How to run (each checkpoint)
1) Create and activate a Python 3.10+ virtual environment.
2) Install deps from `pythonversion/requirement.txt`.
3) Choose a checkpoint folder and run its app:
   - `pythonversion/src/app.py`
   - `pythonversion/part1/src/app.py`
   - `pythonversion/part2/src/app.py`
4) Open `http://localhost:3000`.

Environment variables (optional, for Watsonx online calls)
- `IBMCLOUD_API_KEY`: IBM Cloud API key for token exchange.
- `WATSONX_TOKEN`: Optional direct IAM access token (skips token exchange).
- `PROJECT_ID`: Project id for ML endpoint (default: `skills-network`).

Notes
- Images used by the frontend are served from the original repository image paths to avoid duplicating binaries. You can copy them into `pythonversion/.../public/images` if you prefer.
- Offline fallback returns a deterministic, friendly message for demos without credentials.
- Code mirrors the original logic and routes so the frontend works unchanged.
