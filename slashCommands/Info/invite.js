const { MessageButton, MessageActionRow, MessageEmbed } = require(`discord.js`);
module.exports = {
  name: "invite",
  cooldown: 5,
  description: "Sends you an invite link",
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      const { member, guildId, options } = interaction;
			const { guild } = member;
			const { channel } = member.voice;
			let color = client.settings.get(guild.id, `color`);
      interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setDescription(`
          Invite me to with **Slash commands** to server using [Link](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=287561346801&scope=bot%20applications.commands)
          You can invite me without the **Slash commands** with [Link](https://discord.com/oauth2/authorize?client_id=796800241109565490&permissions=287561346801&scope=bot)
          `)
        ]
      });
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}