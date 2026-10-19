import { git } from '../../lib/git.js';
import { versionManager } from '../../lib/version.js';
import { logger } from '../../lib/logger.js';

async function rollback(projectRoot, oldVersion, state) {
  logger.rollback('Detected failure, starting auto-rollback...');
  
  try {
    if (state.tagged) {
      const { version } = versionManager.read(projectRoot);
      await git.rollbackTag(version);
      logger.info('Deleted contaminated git tag.');
    }
    
    if (state.committed) {
      await git.rollbackCommit();
      logger.info('Reverted last git commit (hard reset).');
    }
    
    if (state.versionBumped) {
      versionManager.update(projectRoot, oldVersion);
      logger.info(`Restored package.json version to ${oldVersion}.`);
    }

    logger.success('System successfully restored to safe state.');
  } catch (err) {
    logger.error(`Fatal error: Rollback failed! Error: ${err.message}`);
  }
}

export async function release(type, flags = {}) {
  const isDryRun = !!flags.dryRun;
  const projectRoot = process.cwd();
  
  let originalVersion = '';
  const transaction = {
    versionBumped: false,
    committed: false,
    tagged: false
  };

  try {
    if (isDryRun) logger.info('--- RUNNING IN DRY RUN MODE ---');

    if (await git.hasUncommittedChanges()) {
      logger.error('Working tree is not clean. Please commit or stash changes.');
      process.exit(1);
    }

    const pkg = versionManager.read(projectRoot);
    originalVersion = pkg.version;
    const newVersion = versionManager.bump(originalVersion, type);

    logger.info(`Starting release pipeline: v${originalVersion} ➡️ v${newVersion}`);

    logger.step(`Updating version in package.json to v${newVersion}`, isDryRun);
    if (!isDryRun) {
      versionManager.update(projectRoot, newVersion);
      transaction.versionBumped = true;
    }

    logger.step(`Creating release commit: chore(release): v${newVersion}`, isDryRun);
    if (!isDryRun) {
      await git.commit(`chore(release): v${newVersion}`);
      transaction.committed = true;
    }

    logger.tag(`Creating git tag: v${newVersion}`, isDryRun);
    if (!isDryRun) {
      await git.tag(newVersion);
      transaction.tagged = true;
    }

    logger.upload('Pushing commit and tags to origin...', isDryRun);
    if (!isDryRun) {
      await git.push();
    }

    logger.success(`${isDryRun ? '[DRY RUN] ' : ''}Release completed: v${newVersion}`);

  } catch (error) {
    logger.error(`Release failed: ${error.message}`);
    
    if (!isDryRun && (transaction.versionBumped || transaction.committed || transaction.tagged)) {
      await rollback(projectRoot, originalVersion, transaction);
    }
    
    process.exit(1);
  }
}
