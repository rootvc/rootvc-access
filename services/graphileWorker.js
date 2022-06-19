const { run, makeWorkerUtils } = require('graphile-worker');
const connectionString = process.env.DATABASE_URL;

const relTaskPath = process.env.NODE_ENV == "production" ? "/../../../" : "/../../../../"

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
      taskDirectory: `${__dirname}${relTaskPath}tasks`
    });

    await runner.promise;
  }

  async addJob(name, data, opts) {
    return await this.workerUtils.addJob(
      name,
      data,
      // using a queuename ensure sequential execution
      // but it prevents the runner from picking up old jobs for some reason
      // the workaround is to set queue_name to NULL directly in the database
      // TODO: on worker startup, process the queue by running a SQL query
      //       that updates old jobs to queue_name=NULL
      { queueName: 'main' }
    );
  }
}

const worker = global.worker || new Worker();
global.worker = worker;

module.exports = worker;
