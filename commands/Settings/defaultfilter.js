const { MessageEmbed, MessageButton } = require("discord.js");
const filters = require("../../botconfig/filters.json")
module.exports = {
  name: "defaultfilter",
  aliases: ["dfilter"],
  usage: "defaultfilter <Filter1 Filter2>",
  cooldown: 10,
  usage: "defaultfilter",
  description: "Defines the Default Filter(s)",
  memberpermissions: ["MANAGE_GUILD"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL], //Only allow specific Users to execute a Command [OPTIONAL]

  run: async (client, message, args) => {
    try {
      const { member } = message;
      const { guild } = member;
      let color = client.settings.get(message.guild.id, `color`);
			let emoji = client.settings.get(message.guild.id, `emoji`);
			let react = client.settings.get(message.guild.id, `react`);
      client.settings.ensure(guild.id, {
        defaultvolume: 50,
        defaultautoplay: false,
        defaultfilters: [`bassboost6`, `clear`]
      });
      if (args.some(a => !filters[a])) {
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} ONE FILTER IS INVALID`)
            .setDescription(`
            To define Multiple default Filters add a SPACE (" ") in between! them
            **All Valid Filters:** ${Object.keys(filters).map(f => `\`${f}\``).join(", ")}
            `)
          ],
        })
      }
      message.react(react);
      client.settings.set(guild.id, args, "defaultfilters");
      return message.reply({
        embeds: [
          new MessageEmbed()
          .setColor(color)
          .setTitle(`${emoji} DEFAULT FILTER SUCCESS`)
          .setDescription(`
          The new default filter${args.length > 0 ? "s are": " is"}: \`${args.map(a=>`\`${a}\``).join(", ")}\`
          `)
        ],
      })
    } catch (e) {
      console.log(e)
			message.reply({
			embeds: [
			new MessageEmbed()
			.setColor("#e63064")
			.setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
			.setDescription(`\`\`\`${e.stack.toString().substr(0, 800)}\`\`\``)
			.setFooter("Error in code: Report this error to kotlin0427 or _destroyer_#1574")
			],
			});
    }
  }
}