const { MessageEmbed, MessageButton } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions")
const FiltersSettings = require("../../botconfig/filters.json");
module.exports = {
  name: "filters",
  category: "Filter",
  usage: "filters",
  aliases: ["listfilter", "listfilters", "allfilters"],
  description: "List all active and possible Filters!",
  cooldown: 5,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
			const { member, guildId, guild } = message;
			const { channel } = member.voice;
      let color = client.settings.get(message.guild.id, `color`);
			let emoji = client.settings.get(message.guild.id, `emoji`);
			let react = client.settings.get(message.guild.id, `react`);
      try {
        let newQueue = client.distube.getQueue(guildId);
        if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
          message.react(react);
          return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} LIST OF AVAILABLE FILTERS!`)
			      .setDescription(`
            All available Filters: ${Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ")}
            **NOTE:** All filters, starting with custom are having there own command.\nPlease use them to define what custom amount you want to add **(¬‿¬)**
            `)
          ],
        })
        }
        message.react(react);
        return message.reply({
          embeds: [
            new MessageEmbed()
            .setColor(color)
            .setTitle(`${emoji} LIST OF AVAILABLE FILTERS!`)
            .setDescription(`
            All available Filters: ${Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ")}
            **NOTE:** All filters, starting with custom are having there own Command.\nPlease use them to define what custom amount you want to add **(¬‿¬)**
            `)
          ],
        })
      } catch (e) {
        console.log(e.stack ? e.stack : e)
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
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}