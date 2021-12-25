const { MessageEmbed, MessageButton } = require("discord.js");
module.exports = {
  name: "autoresume",
  category: "Settings",
  aliases: ["autor"],
  usage: "autoresume",
  cooldown: 10, 
  description: "Enable or Disable the Autoresume for this Guild, if the bot restarts!",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      const { member } = message;
      const { guild } = member;
      let color = client.settings.get(message.guild.id, `color`);
			let emoji = client.settings.get(message.guild.id, `emoji`);
			let react = client.settings.get(message.guild.id, `react`);
      client.settings.set(guild.id, !client.settings.get(guild.id, "autoresume"), "autoresume");
      message.react(react);
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} AUTO RESUME`)
          .setDescription(`The Autoresume got **\`${client.settings.get(guild.id, "autoresume") ? "Enabled" : "Disabled"}\`**`)
        ],
      })
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}