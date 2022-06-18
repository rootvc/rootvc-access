const { run, makeWorkerUtils } = require('graphile-worker');
const connectionString = process.env.DATABASE_URL;

class Worker {
  async init() {
    this.workerUtils = await makeWorkerUtils({
      connectionString: connectionString,
    });
    await this.workerUtils.migrate();
    return this;
  }

  async listen() {
    const runner = await run({
      connectionString: connectionString,
      concurrency: 1, // must be 1 to support historical record import
      noHandleSignals: false,
      pollInterval: 2000,
      taskDirectory: `${__dirname}/../../../../tasks`
    });

    await runner.promise;
  }

  async addJob(name, data, opts) {
    return await this.workerUtils.addJob(
      name,
      data,
      {}
      // { queueName: 'main' }
    );
  }
}

const worker = global.worker || new Worker();
global.worker = worker;

module.exports = worker;
