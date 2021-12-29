const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "ping",
  category: "Info",
  usage: "ping",
  aliases: ["latency"],
  description: "Gives you information on how fast the Bot is",
  cooldown: 1,
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]

  run: async (client, message, args) => {
    try {
      let react = client.settings.get(message.guild.id, `react`);
      let emoji = client.settings.get(message.guild.id, `emoji`);
      message.react(react);
      await message.reply({
          content: `${emoji} Getting the Bot Ping...`,
          ephemeral: true
        })
        .then(newMsg => newMsg.edit({
          content: `**Bot Ping:** \`${Math.floor((Date.now() - message.createdTimestamp) - 2 * Math.floor(client.ws.ping))} ms\`\n**Api Ping:** \`${Math.floor(client.ws.ping)} ms\``,
          ephemeral: true
        }).catch(e => {
          return console.log(e)
        }))
        .catch(e => {
          console.log(e)
        })

    } catch (e) {
      console.log(e)
    }
  }
}
