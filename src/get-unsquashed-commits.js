const getUnsquashedCommits = (context, pluginConfig) => {
  const { sectionRegexStr } = pluginConfig || {};
  const { commits } = context;

  return commits.reduce((acc, commit) => {
    let commitsBody = commit.body;
    if (sectionRegexStr) {
      const sectionRegex = new RegExp(sectionRegexStr, 'g');
      const match = sectionRegex.exec(commit.body);
      if (match) {
        commitsBody = match[1].trim();
      }
    }
    if (!commitsBody.startsWith('* ')) {
      return [...acc, commit];
    }

    const squashedCommits = commitsBody.split('*').map((line) => line.trim());

    return [
      ...acc,
      ...squashedCommits.map((squashedCommit) => {
        const [subject, , ...body] = squashedCommit.split('\n');
        return {
          ...commit,
          subject,
          body: body.join('\n'),
          message: squashedCommit,
        };
      }),
    ];
  }, []);
};

module.exports = { getUnsquashedCommits };
