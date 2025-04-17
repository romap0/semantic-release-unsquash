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
