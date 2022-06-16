import worker from '../services/graphileWorker'

// Hack to let NextJS run a background task (e.g. starting Graphile workers)
// Once NextJS server is running, must hit this endpoint to run workers, etc.
// npm dev and npm start both do this automatically, see package.json
// All run-once startup code should go here

// BUG: This doesn't process any existing jobs, only newly added ones.
async function main() {
  await worker.init();
  console.log("[startup] Initialized Graphile worker service.");
}

main()
  .catch((error) => {
    console.error('[startup] An error occurred. (This should never happen! Handle errors inside job definitions instead.)');
    console.error(error);
  });