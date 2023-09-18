const getUnsquashedCommits = (context) => {
  const { commits } = context;

  return commits.reduce((acc, commit) => {
    if (!commit.body.startsWith('* ')) {
      return [...acc, commit];
    }

    const squashedCommits = commit.body.split('*').map((line) => line.trim());

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
