# Twinkle for Telugu Wikipedia (tewiki)

This repository is the source project for a Telugu Wikipedia adaptation of [Wikimedia Gadgets' Twinkle starter](https://github.com/wikimedia-gadgets/twinkle-starter). It is an in-progress development project, not a ready-to-install replacement for the existing Tewiki Twinkle gadget.

## Current state

The upstream starter framework and its build/test configuration have been imported. The initial starter only registers **Fluff** (revert/rollback tools) and **Diff** (additional diff links). The Telugu-specific nomination workflows, messages, destination mappings, and tests still need implementation. Do not treat this repository as production-ready.

## Safety

- All development and testing must happen here first.
- Do not edit live Telugu Wikipedia pages or the current live Twinkle installation as part of repository development.
- Do not deploy without review and explicit approval from the maintainer.
- Never commit wiki passwords, bot passwords, OAuth secrets, cookies, or other credentials.
- Prefer small changes and verify build/test results before proceeding.

## Tewiki requirements captured so far

- Reuse the existing Tewiki templates and their existing names and parameters. Do not invent replacement templates or translate template names.
- If a needed template is missing, record it for later import; do not block all implementation on an exhaustive template audit.
- Preserve English names for destinations/categories unless a specific local mapping has been supplied.
- Do not auto-detect article language for translation tagging; the editor intentionally invokes the feature.
- Do not create or append Enwiki-style dated XfD venue logs. Preserve other nomination safeguards, tagging, notifications, watchlist behaviour, deletion-history checks, and ordinary venue/list updates where applicable.
- For AfD, create an individual discussion page at `వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Article name`, then add `* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Article name]]` to the `latest-additions` section of `వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు`. Insert after the last nomination bullet and before explanatory text; if no bullets exist, insert at the start of the section. Detect duplicates and abort safely if the section is ambiguous.

## Confirmed destination mappings

| English destination | Tewiki destination |
| --- | --- |
| Wikipedia:Articles for deletion | వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు |
| Wikipedia:Templates for discussion | వికీపీడియా:చర్చ కొరకు మూసలు |
| Wikipedia:Files for discussion | వికీపీడియా:తొలగింపు కొరకు దస్త్రాలు |
| Wikipedia:Categories for discussion | వికీపీడియా:చర్చ కొరకు వర్గాలు |
| Wikipedia:Miscellany for deletion | వికీపీడియా:తొలగింపు కొరకు ఇతర పేజీలు |
| Wikipedia:Redirects for discussion | వికీపీడియా:చర్చ కొరకు దారిమార్పులు |
| Wikipedia:Administrator intervention against vandalism | వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు |
| Wikipedia:Usernames for administrator attention | వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు |
| Wikipedia:Sockpuppet investigations | వికీపీడియా:సాక్ పపెట్ దర్యాప్తు |
| Wikipedia:Administrators' noticeboard/Edit warring | వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు |
| WP:PROD | వికీపీడియా:తొలగింపు విధానం |
| WP:CSD | వికీపీడియా:సత్వర తొలగింపు |
| WP:PROT | వికీపీడియా:సంరక్షణ విధానం |
| Wikipedia:Categories for discussion/Speedy | వికీపీడియా:చర్చ కొరకు వర్గాలు/సత్వరంగా |
| Wikipedia:Files for deletion | వికీపీడియా:తొలగింపు కొరకు దస్త్రాలు |
| Wikipedia:Administrator intervention against vandalism/TB2 | వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు |
| Wikipedia:Sockpuppet investigations/SPI/Guide to filing cases | వికీపీడియా:సాక్ పపెట్ దర్యాప్తు |
| Wikipedia:Administrators' noticeboard/Incidents | వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు |
| Wikipedia:Biographies of living persons/Noticeboard | వికీపీడియా:వ్యాసాల నోటీసుబోర్డు |
| Wikipedia:Conflict of interest/Noticeboard | వికీపీడియా:వ్యాసాల నోటీసుబోర్డు |
| Wikipedia:Dispute resolution noticeboard | వికీపీడియా:వ్యాసాల నోటీసుబోర్డు |
| Wikipedia:Reliable sources/Noticeboard | వికీపీడియా:వ్యాసాల నోటీసుబోర్డు |
| Wikipedia:Neutral point of view/Noticeboard | వికీపీడియా:వ్యాసాల నోటీసుబోర్డు |
| Wikipedia:Help desk | వికీపీడియా:రచ్చబండ (సహాయము) |
| Wikipedia:Teahouse/Questions | వికీపీడియా:రచ్చబండ |
| Wikipedia:Administrators' noticeboard | వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు |

Unmapped destinations remain in English. This includes Requested moves/Technical requests, Template:Protection templates, and Edit filter/False positives/Reports.

## Confirmed category mappings

- `Category:Living people` → `వర్గం:జీవిస్తున్న ప్రజలు`
- `Category:Pages needing translation into English` → `వర్గం:అనువదించ వలసిన పేజీలు` (the Tewiki category is for pages needing translation into Telugu)
- File categories for unknown source/copyright status, no copyright tag, and no fair-use rationale retain their English names.
- Other unspecified categories retain their English names.

## Development

Requires Git, Node.js, and npm. The upstream starter commands are:

- `npm install`
- `npm start` for local development
- `npm test` for tests
- `npm run build` for a production build

The current code has not yet been built or tested in this environment. Check upstream starter documentation and test output before considering any deployment.

## Upstream and licensing

Starter source: [wikimedia-gadgets/twinkle-starter](https://github.com/wikimedia-gadgets/twinkle-starter). The upstream licence file is included in this repository. Review upstream notices and dependencies when making substantial changes.
