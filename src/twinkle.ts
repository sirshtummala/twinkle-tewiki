import { Twinkle, init, SiteConfig } from './core';
import messages from './messages.json';
import mwMessageList from './mw-messages';

// import modules
import { Tag } from './tag';
import { Speedy } from './speedy';
import { Warn } from './warn';
import { Fluff } from './fluff';
import { BatchDelete } from './batchdelete';
import { Protect } from './protect';
import { Block } from './block';
import { Prod } from './prod';
import { Deprod } from './deprod';
import { Welcome } from './welcome';
import { Shared } from './shared';
import { Talkback } from './talkback';
import { Arv } from './arv';
import { Unlink } from './unlink';
import { BatchUndelete } from './batchundelete';

// no customisation; import directly from core
import { DiffCore as Diff } from './core';

// register some globals for debugging, as per twinkle v2
import './globals';

// Check if account is experienced enough to use Twinkle
if (!Morebits.userIsInGroup('autoconfirmed') && !Morebits.userIsInGroup('confirmed')) {
	throw new Error('Twinkle: forbidden!');
}

Twinkle.userAgent = `Twinkle (${mw.config.get('wgWikiID')})`;

Twinkle.summaryAd = ' ([[Project:TW|TW]])';

Twinkle.changeTags = '';

Twinkle.messageOverrides = messages;

Twinkle.extraMwMessages = mwMessageList;

// List of module classes enabled
Twinkle.registeredModules = [Tag, Speedy, Diff, Warn, Fluff, BatchDelete, Protect, Block, Prod, Deprod, Arv, Welcome, Shared, Talkback, Unlink, BatchUndelete];

/**
 * Adjust the following configurations if necessary
 * Check the documentation for each property here:
 * https://twinkle.toolforge.org/core-docs/modules/siteconfig.html
 */

SiteConfig.permalinkSpecialPageName = 'Special:PermanentLink';

SiteConfig.botUsernameRegex = /bot\b/i;

SiteConfig.flaggedRevsNamespaces = [];

SiteConfig.redirectTagAliases = ['#REDIRECT'];

// Go!
init();
