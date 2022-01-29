/**
 * @param {MongoClient} mongo
 * @param {client} [chat]
 */
function handleKill(mongo, chat) {
  const handle = () => {
    mongo?.close();
    chat?.disconnect();
  };

  process.on("SIGINT", handle);
  process.on("SIGTERM", handle);
}

module.exports = { handleKill };
