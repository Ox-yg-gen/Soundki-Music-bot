const { MessageEmbed, Message } = require("discord.js");
const filters = require("../../botconfig/filters.json")
module.exports = {
  name: "defaultfilter",
  cooldown: 10,
  usage: "defaultfilter",
  description: "Defines the default filter(s)",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "filters",
        description: "What filter(s) should be the default filters",
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
      let args = options.getString("filters").split(" ");
      if (!args) args = [options.getString("filters")]
      client.settings.ensure(guild.id, {
        defaultvolume: 50,
        defaultautoplay: false,
        defaultfilters: [`bassboost6`, `clear`]
      });
      if (args.some(a => !filters[a])) {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ONE FILTER IS INVALID`)
            .setDescription(`
            To define Multiple default Filters add a SPACE (" ") in between! them
            **All Valid Filters:** ${Object.keys(filters).map(f => `\`${f}\``).join(", ")}
            `)
          ],
          ephemeral: true,
        })
      }
      client.settings.set(guild.id, args, "defaultfilters");
      return interaction.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} DEFAULT FILTER SUCCESS`)
          .setDescription(`
          The new Default Filter${args.length > 0 ? "s are": " is"}: \`${args.map(a=>`\`${a}\``).join(", ")}\`
          `)
        ],
        ephemeral: true,
      })
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}
