const { run, makeWorkerUtils } = require('graphile-worker');
const connectionString = process.env.DATABASE_URL;

class Worker {
  async init() {
    const relPath = process.env.NODE_ENV == "production"
      ? "/../../../tasks"
      : "/../../../../tasks";

    this.workerUtils = await makeWorkerUtils({
      connectionString: connectionString,
      concurrency: 1, // must be 1 to support historical record import
      noHandleSignals: false,
      pollInterval: 1000,
      taskDirectory: `${__dirname}${relPath}`,
    });

    await this.workerUtils.migrate();

    const runner = await run({
      connectionString: connectionString,
      concurrency: 1, // must be 1 to support historical record import
      noHandleSignals: false,
      pollInterval: 1000,
      taskDirectory: `${__dirname}${relPath}`,
    });

    // If the worker exits (whether through fatal error or otherwise), this promise will resolve/reject:
    await runner.promise;
  }

  async addJob(name, data, opts) {
    return await this.workerUtils.addJob(
      name,
      data,
      opts
    );
  }
}

const worker = global.worker || new Worker();
global.worker = worker;
module.exports = worker;
