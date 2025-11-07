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

  it('should leave commit unchanged when the first non-empty line is not a list item', () => {
    const commits = [
      {
        subject: 'docs: update README',
        body:
          'docs: update README with deployment steps\n' +
          '\n' +
          '* chore: unrelated bullet that should be ignored\n',
        hash: 'd5b14fc5f5438214cb643b846579c94f0bd68e24',
        message:
          'docs: update README\n' +
          '\n' +
          'docs: update README with deployment steps\n' +
          '\n' +
          '* chore: unrelated bullet that should be ignored',
      },
    ];
    const context = { commits };

    expect(getUnsquashedCommits(context)).toEqual(commits);
  });

  it('should split when the first list item follows leading blank lines', () => {
    const commits = [
      {
        subject: 'chore: release v1.2.3',
        body: '\n* fix: correct typo in docs\n* feat: add deployment script',
        hash: 'd5b14fc5f5438214cb643b846579c94f0bd68e24',
        message:
          'chore: release v1.2.3\n' +
          '\n' +
          '* fix: correct typo in docs\n' +
          '* feat: add deployment script',
      },
    ];
    const context = { commits };

    expect(getUnsquashedCommits(context)).toEqual([
      {
        ...commits[0],
        subject: '',
        body: '',
        message: '',
      },
      {
        ...commits[0],
        subject: 'fix: correct typo in docs',
        body: '',
        message: 'fix: correct typo in docs',
      },
      {
        ...commits[0],
        subject: 'feat: add deployment script',
        body: '',
        message: 'feat: add deployment script',
      },
    ]);
  });

  it('should not split when only "-" bullets are present without custom prefixes', () => {
    const commits = [
      {
        subject: 'docs: changelog updates',
        body: '- fix: adjust workflow docs\n- chore: cleanup unused scripts\n',
        hash: '0d63669040808f99dde29bc1b08346ab4e572572',
        message:
          'docs: changelog updates\n' +
          '\n' +
          '- fix: adjust workflow docs\n' +
          '- chore: cleanup unused scripts\n',
      },
    ];
    const context = { commits };

    expect(getUnsquashedCommits(context)).toEqual(commits);
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

      expect(getUnsquashedCommits(context, pluginConfig))
        .toMatchInlineSnapshot(`
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

    it('should fall back to whole match when sectionRegex has no capture group', () => {
      const commits = [
        {
          subject: 'Init',
          body:
            '### Changes\n' +
            '\n' +
            '* refactor: adjust workflow (f8c544a)\n' +
            '\n' +
            '* docs: document shared module (40129ad)\n',
          hash: 'b671c1a316c6205ac8fb73313f9c2fbeeb66b1d5',
          message: 'Init',
        },
      ];
      const context = { commits };
      const pluginConfig = {
        sectionRegexStr: String.raw`### Changes(?:\n|\r\n){2}[\s\S]*?(?=$)`,
      };

      expect(getUnsquashedCommits(context, pluginConfig)).toEqual([
        {
          ...commits[0],
          subject: '',
          body: '',
          message: '',
        },
        {
          ...commits[0],
          subject: 'refactor: adjust workflow (f8c544a)',
          body: '',
          message: 'refactor: adjust workflow (f8c544a)',
        },
        {
          ...commits[0],
          subject: 'docs: document shared module (40129ad)',
          body: '',
          message: 'docs: document shared module (40129ad)',
        },
      ]);
    });

    it('should fall back to sectionHeading when sectionRegexStr is invalid', () => {
      const commits = [
        {
          subject: 'refactor: invalid regex',
          body:
            '### Changes\n' +
            '\n' +
            '* fix: patch issue (1234567)\n' +
            '* feat: add improvement (7654321)\n',
          hash: 'd5b14fc5f5438214cb643b846579c94f0bd68e24',
          message: 'refactor: invalid regex',
        },
      ];
      const context = { commits };
      const pluginConfig = {
        sectionRegexStr: '[',
        sectionHeading: '### Changes',
      };

      expect(getUnsquashedCommits(context, pluginConfig)).toEqual([
        {
          ...commits[0],
          subject: '',
          body: '',
          message: '',
        },
        {
          ...commits[0],
          subject: 'fix: patch issue (1234567)',
          body: '',
          message: 'fix: patch issue (1234567)',
        },
        {
          ...commits[0],
          subject: 'feat: add improvement (7654321)',
          body: '',
          message: 'feat: add improvement (7654321)',
        },
      ]);
    });

    it('should use sectionHeading when provided', () => {
      const commits = [
        {
          subject: 'refactor: move workflow',
          body:
            'refactor: move workflow to script for better testing process (#2)\n' +
            '### Overview\n' +
            '\n' +
            'Details about the changes\n' +
            '\n' +
            '### Changes\n' +
            '- refactor: move workflow to script for better testing process (f8c544a)\n' +
            '- docs: added JSDoc blocks describing function purpose, inputs, and outputs so the shared action module is self-documented (40129ad)\n',
          hash: 'd5b14fc5f5438214cb643b846579c94f0bd68e24',
          message: 'squashed commit',
        },
      ];
      const context = { commits };
      const pluginConfig = {
        sectionHeading: '### Changes',
        listItemPrefixes: ['- '],
      };

      expect(getUnsquashedCommits(context, pluginConfig)).toEqual([
        {
          ...commits[0],
          subject: '',
          body: '',
          message: '',
        },
        {
          ...commits[0],
          subject:
            'refactor: move workflow to script for better testing process (f8c544a)',
          body: '',
          message:
            'refactor: move workflow to script for better testing process (f8c544a)',
        },
        {
          ...commits[0],
          subject:
            'docs: added JSDoc blocks describing function purpose, inputs, and outputs so the shared action module is self-documented (40129ad)',
          body: '',
          message:
            'docs: added JSDoc blocks describing function purpose, inputs, and outputs so the shared action module is self-documented (40129ad)',
        },
      ]);
    });

    it('should support multi-line commits and configurable list item prefixes', () => {
      const commits = [
        {
          subject: 'feature: summary',
          body:
            '### Changes\n' +
            '\n' +
            '* refactor: move workflow to script for better testing process (f8c544a)\n' +
            '  \n' +
            '  body of the first commit\n' +
            '- docs: added JSDoc blocks describing function purpose, inputs, and outputs so the shared action module is self-documented (40129ad)\n' +
            '  \n' +
            '  body of the second commit\n',
          hash: 'a6c8de336a46f19e8bad017d53e8eee329b40621',
          message: 'feature summary',
        },
      ];
      const context = { commits };
      const pluginConfig = {
        sectionHeading: '### Changes',
        listItemPrefixes: ['* ', '- '],
      };

      expect(getUnsquashedCommits(context, pluginConfig)).toEqual([
        {
          ...commits[0],
          subject: '',
          body: '',
          message: '',
        },
        {
          ...commits[0],
          subject:
            'refactor: move workflow to script for better testing process (f8c544a)',
          body: 'body of the first commit',
          message:
            'refactor: move workflow to script for better testing process (f8c544a)\n  \n  body of the first commit',
        },
        {
          ...commits[0],
          subject:
            'docs: added JSDoc blocks describing function purpose, inputs, and outputs so the shared action module is self-documented (40129ad)',
          body: 'body of the second commit',
          message:
            'docs: added JSDoc blocks describing function purpose, inputs, and outputs so the shared action module is self-documented (40129ad)\n  \n  body of the second commit',
        },
      ]);
    });

    it('should fall back to defaults when listItemRegexStr is invalid', () => {
      const commits = [
        {
          subject: 'feat: fallback',
          body: '* fix: address crash\n* chore: tidy scripts\n',
          hash: 'd5b14fc5f5438214cb643b846579c94f0bd68e24',
          message:
            'feat: fallback\n' +
            '\n' +
            '* fix: address crash\n' +
            '* chore: tidy scripts\n',
        },
      ];
      const context = { commits };
      const pluginConfig = {
        listItemRegexStr: '[',
      };

      expect(getUnsquashedCommits(context, pluginConfig)).toEqual([
        {
          ...commits[0],
          subject: '',
          body: '',
          message: '',
        },
        {
          ...commits[0],
          subject: 'fix: address crash',
          body: '',
          message: 'fix: address crash',
        },
        {
          ...commits[0],
          subject: 'chore: tidy scripts',
          body: '',
          message: 'chore: tidy scripts',
        },
      ]);
    });

    it('should support custom listItemRegexStr for non-space bullet style', () => {
      const commits = [
        {
          subject: 'feat: compact bullets',
          body:
            '### Changes\n' +
            '\n' +
            '*refactor: adjust workflow (f8c544a)\n' +
            '*docs: document shared module (40129ad)\n',
          hash: 'fccf5a587416e71d23aeb502f38fd2af455a8287',
          message: 'feat compact bullets',
        },
      ];
      const context = { commits };
      const pluginConfig = {
        sectionHeading: '### Changes',
        listItemRegexStr: String.raw`^\s*\*`,
      };

      expect(getUnsquashedCommits(context, pluginConfig)).toEqual([
        {
          ...commits[0],
          subject: '',
          body: '',
          message: '',
        },
        {
          ...commits[0],
          subject: 'refactor: adjust workflow (f8c544a)',
          body: '',
          message: 'refactor: adjust workflow (f8c544a)',
        },
        {
          ...commits[0],
          subject: 'docs: document shared module (40129ad)',
          body: '',
          message: 'docs: document shared module (40129ad)',
        },
      ]);
    });

    it('should honor listItemPrefix when a single custom marker is provided', () => {
      const commits = [
        {
          subject: 'feat: custom prefix',
          body:
            '### Changes\n' +
            '\n' +
            '-> feat: add timeline widget (1234567)\n' +
            '-> fix: stop crash on safari (89abcde)\n',
          hash: 'e77d38081d69ee053f6bf17d0fd68de6a0c623f8',
          message: 'custom prefix commit',
        },
      ];
      const context = { commits };
      const pluginConfig = {
        sectionHeading: '### Changes',
        listItemPrefix: '-> ',
      };

      expect(getUnsquashedCommits(context, pluginConfig)).toEqual([
        {
          ...commits[0],
          subject: '',
          body: '',
          message: '',
        },
        {
          ...commits[0],
          subject: 'feat: add timeline widget (1234567)',
          body: '',
          message: 'feat: add timeline widget (1234567)',
        },
        {
          ...commits[0],
          subject: 'fix: stop crash on safari (89abcde)',
          body: '',
          message: 'fix: stop crash on safari (89abcde)',
        },
      ]);
    });
  });
});
