# Lightbulb Platform notes

## Current data sources

### Airtable
Airtable is the source of truth for:
- Dashboard grant metrics
- Grants portfolio records
- Reporting records
- Lightbulb timeline
- Greenlight timeline

### Supabase
Supabase is still used for:
- Authentication
- User roles and profile access
- Admin-only edit controls
- What needs attention cards
- Funding panel cards
- Investment news/cards

## Timeline architecture

Both Lightbulb and Greenlight timelines now load from Airtable via:

- netlify/functions/timeline-grants.js

The timeline reads from the Airtable `Individual Grants` table and maps key grant fields into the visual timeline.

Timeline source of truth is Airtable, not Supabase.

## Dormant timeline code

The old timeline add/edit/delete Supabase code may still exist in the HTML files, but the UI no longer exposes timeline editing.

Timeline rows do not open edit panels because `buildPanel()` returns an empty string.

The old Supabase `timeline_items` table should not be used for active timeline management unless this architecture changes again.
