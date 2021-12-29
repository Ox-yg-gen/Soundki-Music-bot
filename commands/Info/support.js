const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "support", 
  category: "Info",
  usage: "support",
  aliases: ["server"],
  cooldown: 1,
  description: "Sends a Link of the Support Server",
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      let react = client.settings.get(message.guild.id, `react`);
      message.react(react);
      message.reply({
        content: "https://discord.gg/zstbC5ftPR"
      });
    } catch (e) {
      console.log(e)
    }
  }
}
