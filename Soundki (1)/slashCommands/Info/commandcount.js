const { MessageEmbed } = require("discord.js");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "commandcount",
  cooldown: 1,
  description: "Shows the Amount of Commands an Categories",
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
      let pointer = client.settings.get(guild.id, `pointer`);
      interaction.reply({
        ephemeral: true,
        embeds: [new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} COMMANDS LIST!`)
          .setDescription(`
          ${pointer} **COMMANDS** \`${client.commands.size}\`
          ${pointer} **SLASH COMMANDS** \`${client.slashCommands.size + client.slashCommands.map(d => d.options).flat().length}\`
          ${pointer} **COMMANDS CATEGORIES** \`${client.categories.length}\`
          `)
        ]
      });
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}