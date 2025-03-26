const { migrateConfig } = require('./configMigrator');
const { updateDependencies, checkAndCreateMissingFiles} = require('./dependencyUpdater');
const { optimizeDependencies } = require('./dependencyOptimizer');
const { createPR } = require('./gitHandler');
const { askConfirmation } = require('./utils');



async function runMigration() {
  console.log('🚀 Starting Vue CLI to Vite migration...');

  const proceed = await askConfirmation('Do you want to continue?');

  if (!proceed) {
    console.log('Migration canceled.');

    return;
  }

  await migrateConfig();
  await checkAndCreateMissingFiles()
  await updateDependencies();
  await optimizeDependencies();

  const createPRConfirm = await askConfirmation('Do you want to push these changes?');

  if (createPRConfirm) {
    await createPR();
    console.log('✅ PR created successfully!');
  } else {
    console.log('❌ PR creation skipped.');
  }

  console.log('✅ Migration completed successfully!');
}

runMigration();
