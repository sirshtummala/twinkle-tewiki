# Twinkle for Telugu Wikipedia (tewiki)

## Purpose
Build a maintained, testable Telugu Wikipedia adaptation of Wikimedia's Twinkle starter, preserving established Twinkle workflows while applying Telugu Wikipedia's page names, templates, and local conventions.

## Safety and rollout
- Develop and test in this repository first.
- Do not modify live Telugu Wikipedia pages or the existing live Twinkle installation during development.
- Do not deploy until the adaptation has been reviewed and the maintainer explicitly approves deployment.
- Prefer small, testable changes and preserve working behaviour.

## Local conventions
- Reuse existing Telugu Wikipedia templates and their existing names/parameters; do not translate template names or invent replacement templates.
- If a required template is missing, record it for later import rather than blocking the whole build.
- Keep English destination names where no Telugu destination mapping has been supplied.
- Do not automatically detect an article's language for translation tagging; the editor selects the feature intentionally.
- Do not create or append Enwiki-style dated XfD venue log pages. Keep the other established nomination safeguards, tagging, notifications, watchlist behaviour, deletion-history checks, and ordinary venue/list updates where applicable.

## Confirmed destination mappings
| English destination | Telugu Wikipedia destination |
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

Unmapped destinations remain as their existing English names. Requested-move technical requests, protection-template documentation, and edit-filter false-positive reports remain unmapped.

## Category mappings
- Category:Living people -> వర్గం:జీవిస్తున్న ప్రజలు
- Category:Pages needing translation into English -> వర్గం:అనువదించ వలసిన పేజీలు (for Tewiki this is the local category for pages needing translation into Telugu)
- Files with unknown source/copyright status, no copyright tag, and no fair-use rationale retain their English category names.
- Other unspecified categories retain their English names.

## AfD local workflow
- Individual discussion page pattern: `వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Article name`.
- Add the exact bullet `* [[వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు/Article name]]` to the `latest-additions` section of `వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు`.
- Insert after the last existing nomination bullet and before explanatory text; if there are no bullets, insert at the start of the section.
- Check for duplicates and abort safely if the target section is ambiguous.
- This special latest-additions workflow applies to article deletion nominations only, not other XfD types.

## Initial implementation sequence
1. Import the upstream Twinkle starter without modifying the live wiki.
2. Establish a clean build/test baseline and document upstream version and license.
3. Add Tewiki configuration and destination/category mappings.
4. Adapt nomination workflows, including the no-dated-log rule and AfD latest-additions section.
5. Audit modules for hard-coded English destinations, categories, namespace assumptions, and logging side effects.
6. Add or update tests for local workflows and safe failure cases.
7. Document manual test steps and a staged rollout plan.

## Acceptance criteria
- The project builds and tests cleanly.
- Existing Twinkle safeguards and workflows are preserved except for the explicitly documented Tewiki differences.
- No Enwiki-style dated XfD venue log pages are created or edited.
- AfD adds a discussion page and one deduplicated latest-additions bullet safely.
- No live wiki deployment occurs without explicit approval.
