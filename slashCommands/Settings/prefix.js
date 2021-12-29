const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
module.exports = {
  name: "prefix",
  cooldown: 10,
  description: "Change the server prefix!",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "prefix",
        description: "What should be the new prefix?",
        required: true
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const { member, options } = interaction;
      const { guild } = member;
      let color = client.settings.get(guild.id, `color`);
      let emoji = client.settings.get(guild.id, `emoji`);
      let newPrefix = options.getString("prefix");
      client.settings.ensure(guild.id, {
        prefix: config.prefix
      });
      client.settings.set(guild.id, newPrefix, "prefix");
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} NEW PREFIX`)
          .setDescription(`The new Prefix is now \`${newPrefix}\``)
        ],
      })
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}