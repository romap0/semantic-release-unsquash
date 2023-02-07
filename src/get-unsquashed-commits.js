const getUnsquashedCommits = (context) => {
  const { commits } = context;
  console.log(commits);

  return commits.reduce((acc, commit) => {
    if (!commit.body.startsWith('* ')) {
      return [...acc, commit];
    }

    const stashedCommits = commit.body.split('*').map((line) => line.trim());

    return [
      ...acc,
      commit,
      ...stashedCommits.map((stashedCommit) => {
        const [subject, , ...body] = stashedCommit.split('\n');
        return {
          ...commit,
          subject,
          body: body.join('\n'),
          message: stashedCommit,
        };
      }),
    ];
  }, []);
};

module.exports = { getUnsquashedCommits };
