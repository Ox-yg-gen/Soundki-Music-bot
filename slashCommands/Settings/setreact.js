const { MessageEmbed, Message } = require("discord.js");
module.exports = {
  name: "setreact",
  cooldown: 10,
  description: "Change the emoji which the bot reacts with on message",
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
      let prefix = client.settings.get(guild.id, "prefix");
      let emoji = client.settings.get(guild.id, `emoji`);
      let color = client.settings.get(guild.id, `color`);
      let newEmoji = options.getString("emoji");
      client.settings.ensure(guild.id, {
        react: "<:bluewaves:891379368037859409>"
      });
      client.settings.set(guild.id, newEmoji, "react");
      let BnewReact = client.settings.get(guild.id, `react`);
      return interaction.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} NEW MESSAGE REACTION`)
          .setDescription(`Successfully set the reaction to ${BnewReact}\nTry it out with \`${prefix}play LeXxìv Stay With Me\``)
        ],
      });
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}