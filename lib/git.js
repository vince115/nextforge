import { execa } from 'execa';

export const git = {
  async hasUncommittedChanges() {
    const { stdout } = await execa('git', ['status', '--porcelain']);
    return stdout.trim().length > 0;
  },

  async commit(message) {
    await execa('git', ['add', '.']);
    await execa('git', ['commit', '-m', message]);
  },

  async tag(version) {
    const tagName = `v${version}`;
    await execa('git', ['tag', tagName]);
    return tagName;
  },

  async push() {
    await execa('git', ['push', 'origin', 'HEAD', '--tags']);
  },

  async rollbackCommit() {
    await execa('git', ['reset', '--hard', 'HEAD~1']);
  },

  async rollbackTag(version) {
    const tagName = `v${version}`;
    await execa('git', ['tag', '-d', tagName]);
  }
};
