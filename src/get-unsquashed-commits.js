/**
 * @typedef {Object} Commit
 * @property {string} subject
 * @property {string} [body]
 * @property {string} [hash]
 * @property {string} [message]
 * @property {Object.<string, unknown>} [raw]
 */

/**
 * @typedef {Object} GetUnsquashedCommitsConfig
 * @property {string} [sectionHeading] Heading string that precedes the commit list.
 * @property {string} [sectionRegexStr] Regex used to extract the commit list section.
 * @property {string[]} [listItemPrefixes] Bullet prefixes treated as list markers.
 * @property {string} [listItemPrefix] Single bullet prefix shorthand.
 * @property {string} [listItemRegexStr] Custom regex to detect list markers.
 */

/**
 * @typedef {Object} ListItemMatcher
 * @property {(line: string) => boolean} isListItem Checks if a line is a list item.
 * @property {(line: string) => string} stripPrefix Removes the marker from a line.
 */

/** @type {string[]} Default bullet prefixes recognised when none are provided. */
const DEFAULT_LIST_ITEM_PREFIXES = ['* '];

/**
 * Escapes literal characters so they can be embedded inside a regex safely.
 *
 * @param {string} value
 * @returns {string}
 */
const escapeForRegex = (value) => value.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&');

/**
 * Normalises the configured list item prefixes, falling back to defaults.
 *
 * @param {GetUnsquashedCommitsConfig} [config]
 * @returns {string[]}
 */
const getListItemPrefixes = (config = {}) => {
  const prefixes = [];
  const { listItemPrefixes, listItemPrefix } = config;

  if (Array.isArray(listItemPrefixes)) {
    prefixes.push(
      ...listItemPrefixes.filter(
        (prefix) => typeof prefix === 'string' && prefix.length > 0,
      ),
    );
  }

  if (typeof listItemPrefix === 'string' && listItemPrefix.length > 0) {
    prefixes.push(listItemPrefix);
  }

  if (prefixes.length === 0) {
    return DEFAULT_LIST_ITEM_PREFIXES;
  }

  return [...new Set(prefixes)];
};

/**
 * Builds helpers that can recognise and strip bullet markers from lines.
 *
 * @param {GetUnsquashedCommitsConfig} [config]
 * @returns {ListItemMatcher | null}
 */
const createListItemMatcher = (config = {}) => {
  const { listItemRegexStr } = config;

  if (typeof listItemRegexStr === 'string' && listItemRegexStr.length > 0) {
    let userRegex;
    try {
      userRegex = new RegExp(listItemRegexStr);
    } catch (_) {
      userRegex = null;
    }

    if (userRegex) {
      return {
        isListItem(line) {
          userRegex.lastIndex = 0;
          return userRegex.test(line);
        },
        stripPrefix(line) {
          userRegex.lastIndex = 0;
          return line.replace(userRegex, '');
        },
      };
    }
  }

  const prefixes = getListItemPrefixes(config);
  if (prefixes.length === 0) {
    return null;
  }

  const prefixPattern = `^\\s*(?:${prefixes
    .map((prefix) => escapeForRegex(prefix))
    .join('|')})`;
  const prefixRegex = new RegExp(prefixPattern);

  return {
    isListItem(line) {
      prefixRegex.lastIndex = 0;
      return prefixRegex.test(line);
    },
    stripPrefix(line) {
      prefixRegex.lastIndex = 0;
      return line.replace(prefixRegex, '');
    },
  };
};

/**
 * Extracts the portion of a squashed commit body that contains the commit list.
 *
 * @param {string} [body]
 * @param {GetUnsquashedCommitsConfig} [config]
 * @returns {string}
 */
const selectCommitSection = (body = '', config = {}) => {
  if (!body) {
    return '';
  }

  const { sectionRegexStr, sectionHeading } = config;

  if (typeof sectionRegexStr === 'string' && sectionRegexStr.length > 0) {
    try {
      const sectionRegex = new RegExp(sectionRegexStr, 'g');
      const match = sectionRegex.exec(body);
      if (match) {
        const capturedGroup = match
          .slice(1)
          .find((value) => typeof value === 'string' && value !== undefined);
        return (capturedGroup ?? match[0]).trim();
      }
    } catch (_) {
      // Fall through to heading/default behavior
    }
  }

  if (typeof sectionHeading === 'string' && sectionHeading.length > 0) {
    const index = body.indexOf(sectionHeading);
    if (index !== -1) {
      return body.slice(index + sectionHeading.length).trimStart();
    }
  }

  return body;
};

/**
 * Converts a commit list section into individual message blocks.
 *
 * @param {string} sectionText
 * @param {ListItemMatcher | null} matcher
 * @returns {string[]}
 */
const splitSquashedMessages = (sectionText, matcher) => {
  if (!sectionText || !matcher) {
    return [];
  }

  const lines = sectionText.split(/\r?\n/);
  const messages = [];
  let currentLines = null;

  lines.forEach((line) => {
    if (matcher.isListItem(line)) {
      if (currentLines && currentLines.length > 0) {
        messages.push(currentLines.join('\n').trim());
      }
      const strippedLine = matcher.stripPrefix(line).trimStart();
      currentLines = [strippedLine];
      return;
    }

    if (currentLines) {
      currentLines.push(line);
    }
  });

  if (currentLines && currentLines.length > 0) {
    messages.push(currentLines.join('\n').trim());
  }

  return messages.filter((message) => message.length > 0);
};

/**
 * Expands squashed commits into individual commit objects for downstream plugins.
 *
 * @param {{ commits: Commit[] }} context Semantic-release context containing commits.
 * @param {GetUnsquashedCommitsConfig} [pluginConfig]
 * @returns {Commit[]}
 */
const getUnsquashedCommits = (context, pluginConfig = {}) => {
  const { commits } = context;
  const matcher = createListItemMatcher(pluginConfig);
  const hasSectionRegex =
    typeof pluginConfig.sectionRegexStr === 'string' &&
    pluginConfig.sectionRegexStr.length > 0;
  const hasSectionHeading =
    typeof pluginConfig.sectionHeading === 'string' &&
    pluginConfig.sectionHeading.length > 0;
  const shouldVerifyFirstLine = !hasSectionRegex && !hasSectionHeading;

  const unsquashedCommits = [];

  for (const commit of commits) {
    const body = commit.body ?? '';
    const sectionText = selectCommitSection(body, pluginConfig);
    if (shouldVerifyFirstLine) {
      const firstNonEmptyLine =
        sectionText.split(/\r?\n/).find((line) => line.trim().length > 0) ?? '';

      if (!matcher?.isListItem(firstNonEmptyLine)) {
        unsquashedCommits.push(commit);
        continue;
      }
    }
    const squashedMessages = splitSquashedMessages(sectionText, matcher);

    if (squashedMessages.length === 0) {
      unsquashedCommits.push(commit);
      continue;
    }

    const unsquashed = squashedMessages
      .map((message) => {
        const normalizedMessage = message.replace(/\r\n/g, '\n').trim();
        const [subjectLine = '', ...rest] = normalizedMessage.split('\n');
        const subject = subjectLine.trim();
        const bodyLines = rest.join('\n').trim();

        if (!subject) {
          return null;
        }

        return {
          ...commit,
          subject,
          body: bodyLines,
          message: normalizedMessage,
        };
      })
      .filter(Boolean);

    if (unsquashed.length === 0) {
      unsquashedCommits.push(commit);
      continue;
    }

    const placeholderCommit = {
      ...commit,
      subject: '',
      body: '',
      message: '',
    };

    unsquashedCommits.push(placeholderCommit, ...unsquashed);
  }

  return unsquashedCommits;
};

module.exports = { getUnsquashedCommits };
