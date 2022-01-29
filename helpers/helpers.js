const TWITCH_REQUEST_DELAY_MINUTES = process.env.TWITCH_REQUEST_DELAY_MINUTES;

/**
 * @param {string} message
 * @return {{command: string, argument: string}}
 */
function splitMessage(message) {
  const splitted = message.split(" ");

  return {
    command: splitted.shift().trim().toLowerCase(),
    argument: splitted.join(" ").trim(),
  };
}

/**
 * @param {Date} time
 * @return {number}
 */
function getMinutesUntilNextRequest(time) {
  if (time) {
    return (
      TWITCH_REQUEST_DELAY_MINUTES -
      Math.round(((new Date() - (time % 86400000)) % 3600000) / 60000)
    );
  }

  return 0;
}

module.exports = { splitMessage, getMinutesUntilNextRequest };
