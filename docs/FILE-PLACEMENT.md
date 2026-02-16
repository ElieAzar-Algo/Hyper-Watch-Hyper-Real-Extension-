# Where project files belong

| File / purpose | Location | Why |
|----------------|----------|-----|
| **AGENTS.md** | **Project root** | Cursor and other AI tools look for it at the repo root by convention. Keep it here. |
| **PR template** | **`.github/PULL_REQUEST_TEMPLATE.md`** | GitHub’s standard location; it auto-fills the PR description when you open a PR. |
| **Contributing / how-to docs** | **`docs/`** | Human-facing docs (e.g. how to open a PR) live here so the root stays clean. |
| **One-off PR body drafts** | **Don’t commit** or **delete after use** | Drafts like `PR_DESCRIPTION.md` or `pr-body.md` are temporary; the canonical template is in `.github/`. |

**Summary:** Keep **AGENTS.md** in the root. Put **reusable docs** in **`docs/`**. Put **GitHub-specific templates** in **`.github/`**. Avoid keeping one-off PR drafts in the repo root.
