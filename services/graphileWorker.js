const { run, makeWorkerUtils } = require('graphile-worker');
const connectionString = process.env.DATABASE_URL;

class Worker {
  async init() {
    this.workerUtils = await makeWorkerUtils({
      connectionString: connectionString,
    });
    await this.workerUtils.migrate();
    const runner = await run({
      connectionString: connectionString,
      concurrency: 1, // must be 1 to support historical record import
      noHandleSignals: false,
      pollInterval: 1000,
      taskDirectory: `${__dirname}/../../../../tasks`,
    });

    // If the worker exits (whether through fatal error or otherwise), this promise will resolve/reject:
    await runner.promise;

    singleton = this;
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
