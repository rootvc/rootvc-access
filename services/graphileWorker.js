require('dotenv').config();
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
      taskDirectory: `${__dirname}/../tasks`,
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

// const setup = async () => {
//   const workerUtils = await makeWorkerUtils({
//     connectionString: connectionString,
//   });
//   await workerUtils.migrate();

//   await run({
//     connectionString: connectionString,
//     concurrency: 1, // must be 1 to support historical record import
//     noHandleSignals: false,
//     pollInterval: 1000,
//     taskDirectory: `${__dirname}/../tasks`,
//   });

//   global.workerUtils = workerUtils;

//   return workerUtils;
// };

// module.exports = global.workerUtils || setup();
const singleton = new Worker();
module.exports = singleton;
