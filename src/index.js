const {
  analyzeCommits: originalAnalyzeCommits,
} = require('@semantic-release/commit-analyzer');
const {
  generateNotes: originalGenerateNotes,
} = require('@semantic-release/release-notes-generator');

const { getUnsquashedCommits } = require('./get-unsquashed-commits');

const analyzeCommits = async (pluginConfig, context) => {
  const { commitAnalyzerConfig, getUnsquashedCommitsConfig } =
    pluginConfig || {};
  const commits = getUnsquashedCommits(context, getUnsquashedCommitsConfig);

  return originalAnalyzeCommits(commitAnalyzerConfig ?? {}, {
    ...context,
    commits,
  });
};

const generateNotes = async (pluginConfig, context) => {
  const { notesGeneratorConfig, getUnsquashedCommitsConfig } =
    pluginConfig || {};
  if (notesGeneratorConfig === false) {
    return;
  }
  const commits = getUnsquashedCommits(context, getUnsquashedCommitsConfig);

  return originalGenerateNotes(notesGeneratorConfig ?? {}, {
    ...context,
    commits,
  });
};

module.exports = { analyzeCommits, generateNotes };
