const { getUnsquashedCommits } = require('./get-unsquashed-commits');

describe(getUnsquashedCommits.name, () => {
  it('should return unsquashed commits', () => {
    const commits = [
      {
        subject: 'Init',
        body:
          '* fix: restrict job branches\n' +
          '\n' +
          'Foobar string\n' +
          '\n' +
          '* ci: use image with git\n' +
          '\n' +
          '* ci: fix job\n' +
          '\n' +
          '* feat: initial commit\n',
        hash: '0d63669040808f99dde29bc1b08346ab4e572572',
        message:
          'Init\n' +
          '\n' +
          '* fix: restrict job branches\n' +
          '\n' +
          'Foobar string\n' +
          '\n' +
          '* ci: use image with git\n' +
          '\n' +
          '* ci: fix job\n' +
          '\n' +
          '* feat: initial commit',
      },
    ];
    const context = { commits };

    expect(getUnsquashedCommits(context)).toMatchInlineSnapshot(`
      [
        {
          "body": "",
          "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
          "message": "",
          "subject": "",
        },
        {
          "body": "Foobar string",
          "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
          "message": "fix: restrict job branches

      Foobar string",
          "subject": "fix: restrict job branches",
        },
        {
          "body": "",
          "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
          "message": "ci: use image with git",
          "subject": "ci: use image with git",
        },
        {
          "body": "",
          "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
          "message": "ci: fix job",
          "subject": "ci: fix job",
        },
        {
          "body": "",
          "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
          "message": "feat: initial commit",
          "subject": "feat: initial commit",
        },
      ]
    `);
  });

  describe('with pluginConfig', () => {
    it('should return unsquashed commits with sectionRegex', () => {
      const commits = [
        {
          subject: 'Init',
          body:
            '### Changes\n' +
            '\n' +
            '* fix: restrict job branches\n' +
            '\n' +
            'Foobar string\n' +
            '\n' +
            '* ci: use image with git\n' +
            '\n' +
            '* ci: fix job\n' +
            '\n' +
            '* feat: initial commit\n',
          hash: '0d63669040808f99dde29bc1b08346ab4e572572',
          message:
            'Init\n' +
            '\n' +
            '* fix: restrict job branches\n' +
            '\n' +
            'Foobar string\n' +
            '\n' +
            '* ci: use image with git\n' +
            '\n' +
            '* ci: fix job\n' +
            '\n' +
            '* feat: initial commit',
        },
      ];
      const context = { commits };
      const pluginConfig = {
        // Another sample may be ### Changes(?:\n|\\n|\\\\n){2}([\s\S]*?)(?=###)
        sectionRegexStr: '### Changes(?:\n|\\n|\\\\n){2}([\\s\\S]*?)(?=$)',
      };

      expect(getUnsquashedCommits(context, pluginConfig)).toMatchInlineSnapshot(`
        [
          {
            "body": "",
            "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
            "message": "",
            "subject": "",
          },
          {
            "body": "Foobar string",
            "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
            "message": "fix: restrict job branches

        Foobar string",
            "subject": "fix: restrict job branches",
          },
          {
            "body": "",
            "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
            "message": "ci: use image with git",
            "subject": "ci: use image with git",
          },
          {
            "body": "",
            "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
            "message": "ci: fix job",
            "subject": "ci: fix job",
          },
          {
            "body": "",
            "hash": "0d63669040808f99dde29bc1b08346ab4e572572",
            "message": "feat: initial commit",
            "subject": "feat: initial commit",
          },
        ]
      `);
    });
  });
});
