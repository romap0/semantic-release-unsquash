# **semantic-release-unsquash**

A tiny wrapper for [commit-analyzer](https://github.com/semantic-release/commit-analyzer) and [release-notes-generator](https://github.com/semantic-release/release-notes-generator) which works with squashed MRs

[![npm latest version](https://img.shields.io/npm/v/semantic-release-unsquash/latest.svg)](https://www.npmjs.com/package/semantic-release-unsquash)

## Install

```bash
$ npm install -D semantic-release-unsquash
```

## Usage

The plugin does not have it`s own configuration, but it passes configuration to wrapped plugins

```json
{
  "plugins": [
    ["semantic-release-unsquash", {
      "commitAnalyzerConfig": {
        "preset": "angular",
        "parserOpts": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
        }
      },
      "notesGeneratorConfig": {
        "preset": "angular",
        "parserOpts": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
        },
        "writerOpts": {
          "commitsSort": ["subject", "scope"]
        }
      }
    }]
  ]
}
```

### Deactivate the generation of release notes

To deactivate the generation of release notes, e.g. if you use your own / another plugin to generate them, you can do this with:

```json
{
  "plugins": [
    [
      "semantic-release-unsquash",
      {
        "commitAnalyzerConfig": { },
        "notesGeneratorConfig": false
      }
    ]
  ]
}
```

### Usage with Github

GitHub automatically adds a list of squashed commit messages to the squash commit message.

### Usage with GitLab

To use this plugin with GitLab, you need to go to your project settings and in the **Merge Requests** section update the **Squash commit message template** field to the following:

```ruby
%{title}

%{all_commits}
```

## Configuring commit section detection

You can pass `getUnsquashedCommitsConfig` to fine‑tune how the plugin finds
and expands squashed commits inside the merge commit body:

```json
{
  "plugins": [
    [
      "semantic-release-unsquash",
      {
        "getUnsquashedCommitsConfig": {
          "sectionHeading": "### Changes",
          "sectionRegexStr": "### Changes(?:\\n|\\r\\n){2}([\\s\\S]*?)(?=$)",
          "listItemPrefixes": ["* ", "- "],
          "listItemRegexStr": "^\\s*\\*"
        }
      }
    ]
  ]
}
```

- `sectionHeading`: literal string to locate the start of the commit list.
  Everything after the heading (trimmed) is parsed.
- `sectionRegexStr`: alternative regex selector. If it contains a capture
  group, that content is used; otherwise the matched substring is parsed.
- `listItemPrefixes` / `listItemPrefix`: configure bullet prefixes if you use
  something other than the defaults (`* `, `- `, `+ `).
- `listItemRegexStr`: full custom matcher for bullets (takes priority over
  prefixes), useful for compact formats such as `*feat: ...`.

These options can be combined. Multi-line commit bodies remain attached to the
bullet that introduced them.
