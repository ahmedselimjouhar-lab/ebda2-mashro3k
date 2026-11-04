# Security notes — V5

## What is protected
- Scoring weights, answer keys, dimension mappings, career profiles, and opportunity ranking are kept in `api/assessment.js` and are not returned by the API.
- Only one question page is returned per authenticated request.
- The API requires a short-lived HMAC-signed session token based on the Vercel environment variable `ASSESSMENT_SECRET`.
- Public question IDs are opaque HMAC-derived values and do not reveal internal dimension codes.
- API responses are marked `no-store` and `noindex`.

## What cannot be fully protected
Question wording and response options must be displayed to the user. A person can copy or photograph a question they can see. A determined actor can also automate multiple valid sessions. A private repository, short-lived tokens, and Vercel Firewall rate limiting reduce bulk extraction, but do not guarantee that no one can copy the visible content.

## Required deployment controls
1. GitHub repository visibility must be Private.
2. Add `ASSESSMENT_SECRET` as a Vercel Environment Variable (32+ random characters; 64 hex characters recommended).
3. Apply Vercel Firewall rate limiting to `/api/assessment`.
4. Never expose `ASSESSMENT_SECRET` in client-side JavaScript, HTML, source maps, or the repository.

## Data handling
The browser stores answers and profile values in localStorage to allow resume. The browser sends them to the Vercel Function only when scoring is requested. This version does not write answers to an application database. Hosting providers may keep request metadata and operational logs under their own policies.
