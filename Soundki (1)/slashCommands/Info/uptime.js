const { MessageEmbed } = require("discord.js");
const { duration } = require("../../handlers/functions")
module.exports = {
  name: "uptime",
  cooldown: 1,
  description: "Returns the duration on how long the Bot is online",
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      const { member, guildId, options } = interaction;
			const { guild } = member;
			const { channel } = member.voice;
			let color = client.settings.get(guild.id, `color`);
      let emoji = client.settings.get(guild.id, `emoji`);
      interaction.reply({
        ephemeral: true,
        embeds: [new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} ${client.user.username.toUpperCase()} UPTIME`)
          .setDescription(`**${client.user.username}** is online since: ${duration(client.uptime).map(t=>`\`${t}\``).join(", ")}`)
        ]
      });
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}