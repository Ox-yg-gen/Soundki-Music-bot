const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "setemoji",
  cooldown: 10,
  description: "Change the default emoji of the bot",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "emoji",
        description: "What should be the new emoji?",
        required: true
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const { member, options } = interaction;
      const { guild } = member;
      let color = client.settings.get(guild.id, `color`);
      let newEmoji = options.getString("emoji");
      client.settings.ensure(guild.id, {
        emoji: "<:bluewaves:891379368037859409>"
      });
      client.settings.set(guild.id, newEmoji, "emoji");
      let BnewEmoji = client.settings.get(guild.id, `emoji`);
      return interaction.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${BnewEmoji} NEW EMBED EMOJI`)
          .setDescription(`Successfully set the emoji to ${BnewEmoji}`)
        ],
      });
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}