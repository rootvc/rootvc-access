module.exports = async (payload, helpers) => {
    const { name } = payload;
    helpers.logger.info(`Hello, ${name}`);
};

    // TODO: Enrich Person
    // TODO: Insert Company