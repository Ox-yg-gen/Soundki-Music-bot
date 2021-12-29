const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "defaultautoplay",
  cooldown: 5,
  description: "Defines if autoplay should be enabled on default or not!",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      const { member, options } = interaction;
      const { guild } = member;
      let color = client.settings.get(guild.id, `color`);
      let emoji = client.settings.get(guild.id, `emoji`);
      client.settings.ensure(guild.id, {
        defaultvolume: 50,
        defaultautoplay: false,
        defaultfilters: [`bassboost6`, `clear`]
      });
      client.settings.set(guild.id, !client.settings.get(guild.id, "defaultautoplay"), "defaultautoplay");
      return interaction.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} DEFAULT AUTOPLAY`)
          .setDescription(`
          The Default autoplay got **\`${client.settings.get(guild.id, "defaultautoplay") ? "Enabled" : "Disabled"}\`**
          `)
        ],
        ephemeral: true,
      })
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}