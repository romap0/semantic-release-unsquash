const DEFAULT_LIST_ITEM_PREFIXES = ['* ', '- ', '+ '];

const escapeForRegex = (value) => value.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&');

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

const createListItemMatcher = (config = {}) => {
  const { listItemRegexStr } = config;

  if (typeof listItemRegexStr === 'string' && listItemRegexStr.length > 0) {
    const userRegex = new RegExp(listItemRegexStr);
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

const selectCommitSection = (body = '', config = {}) => {
  if (!body) {
    return '';
  }

  const { sectionRegexStr, sectionHeading } = config;

  if (typeof sectionRegexStr === 'string' && sectionRegexStr.length > 0) {
    const sectionRegex = new RegExp(sectionRegexStr, 'g');
    const match = sectionRegex.exec(body);
    if (match) {
      const capturedGroup = match
        .slice(1)
        .find((value) => typeof value === 'string' && value !== undefined);
      return (capturedGroup ?? match[0]).trim();
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

const getUnsquashedCommits = (context, pluginConfig = {}) => {
  const { commits } = context;
  const matcher = createListItemMatcher(pluginConfig);

  return commits.reduce((acc, commit) => {
    const body = commit.body ?? '';
    const sectionText = selectCommitSection(body, pluginConfig);
    const squashedMessages = splitSquashedMessages(sectionText, matcher);

    if (squashedMessages.length === 0) {
      return [...acc, commit];
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
      return [...acc, commit];
    }

    const placeholderCommit = {
      ...commit,
      subject: '',
      body: '',
      message: '',
    };

    return [...acc, placeholderCommit, ...unsquashed];
  }, []);
};

module.exports = { getUnsquashedCommits };
