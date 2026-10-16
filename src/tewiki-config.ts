/**
 * Confirmed Telugu Wikipedia (tewiki) local conventions.
 *
 * Keep unmapped destinations in English. Do not add speculative mappings here.
 * These constants are project requirements; module-specific implementation and
 * tests must consume them before this project is considered production-ready.
 */

export const destinationMappings: Record<string, string> = {
	'Wikipedia:Articles for deletion': 'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు',
	'Wikipedia:Templates for discussion': 'వికీపీడియా:చర్చ కొరకు మూసలు',
	'Wikipedia:Files for discussion': 'వికీపీడియా:తొలగింపు కొరకు దస్త్రాలు',
	'Wikipedia:Categories for discussion': 'వికీపీడియా:చర్చ కొరకు వర్గాలు',
	'Wikipedia:Miscellany for deletion': 'వికీపీడియా:తొలగింపు కొరకు ఇతర పేజీలు',
	'Wikipedia:Redirects for discussion': 'వికీపీడియా:చర్చ కొరకు దారిమార్పులు',
	'Wikipedia:Administrator intervention against vandalism': 'వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు',
	'Wikipedia:Usernames for administrator attention': 'వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు',
	'Wikipedia:Sockpuppet investigations': 'వికీపీడియా:సాక్ పపెట్ దర్యాప్తు',
	"Wikipedia:Administrators' noticeboard/Edit warring": 'వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు',
	'WP:PROD': 'వికీపీడియా:తొలగింపు విధానం',
	'WP:CSD': 'వికీపీడియా:సత్వర తొలగింపు',
	'WP:PROT': 'వికీపీడియా:సంరక్షణ విధానం',
	'Wikipedia:Categories for discussion/Speedy': 'వికీపీడియా:చర్చ కొరకు వర్గాలు/సత్వరంగా',
	'Wikipedia:Files for deletion': 'వికీపీడియా:తొలగింపు కొరకు దస్త్రాలు',
	'Wikipedia:Administrator intervention against vandalism/TB2': 'వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు',
	'Wikipedia:Sockpuppet investigations/SPI/Guide to filing cases': 'వికీపీడియా:సాక్ పపెట్ దర్యాప్తు',
	"Wikipedia:Administrators' noticeboard/Incidents": 'వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు',
	'Wikipedia:Biographies of living persons/Noticeboard': 'వికీపీడియా:వ్యాసాల నోటీసుబోర్డు',
	'Wikipedia:Conflict of interest/Noticeboard': 'వికీపీడియా:వ్యాసాల నోటీసుబోర్డు',
	'Wikipedia:Dispute resolution noticeboard': 'వికీపీడియా:వ్యాసాల నోటీసుబోర్డు',
	'Wikipedia:Reliable sources/Noticeboard': 'వికీపీడియా:వ్యాసాల నోటీసుబోర్డు',
	'Wikipedia:Neutral point of view/Noticeboard': 'వికీపీడియా:వ్యాసాల నోటీసుబోర్డు',
	'Wikipedia:Help desk': 'వికీపీడియా:రచ్చబండ (సహాయము)',
	'Wikipedia:Teahouse/Questions': 'వికీపీడియా:రచ్చబండ',
	"Wikipedia:Administrators' noticeboard": 'వికీపీడియా:నిర్వాహకుల నోటీసు బోర్డు',
};

export const categoryMappings: Record<string, string> = {
	'Category:Living people': 'వర్గం:జీవిస్తున్న ప్రజలు',
	'Category:Pages needing translation into English': 'వర్గం:అనువదించ వలసిన పేజీలు',
};

export const tewikiDeletionWorkflow = {
	/** Never create or append Enwiki-style dated XfD venue log pages. */
	createDatedXfdVenueLogs: false,
	/** Tewiki-specific article deletion discussion root. */
	afdDiscussionRoot: 'వికీపీడియా:తొలగింపు కొరకు వ్యాసాలు',
	/** Anchor on the main AfD page where new nomination links are listed. */
	afdLatestAdditionsAnchor: 'latest-additions',
	/** This is intentionally an editor-selected action, not automatic language detection. */
	translationTagRequiresEditorSelection: true,
} as const;

/**
 * Translate a destination only when a mapping has explicitly been confirmed.
 * Callers should pass the canonical English page name and preserve unmapped
 * values exactly as supplied.
 */
export function mapDestination(englishTitle: string): string {
	return destinationMappings[englishTitle] ?? englishTitle;
}

/**
 * Translate only known category names. Unknown categories intentionally remain
 * unchanged to avoid inventing local categories.
 */
export function mapCategory(englishTitle: string): string {
	return categoryMappings[englishTitle] ?? englishTitle;
}
