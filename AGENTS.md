<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI Studio is one chat route for every agent (agent chosen via search param), backed by a shared in-memory store in src/lib/studio-store.ts; mock data lives in src/lib/studio-data.ts so permissions can later move to the server.
- Campaign draft overview, editor and preview are separate routes under /campaigns/draft that read the same store, so edits show everywhere.
- Define agent identities and responsibilities in a browser-safe catalog; the introductory directory does not simulate live AI conversations.
