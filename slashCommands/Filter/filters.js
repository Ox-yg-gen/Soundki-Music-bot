const { MessageEmbed, Message } = require("discord.js");
const FiltersSettings = require("../../botconfig/filters.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
  name: "filters",
  description: "List all active and possible filters!",
  cooldown: 5,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
			const { member, guildId, options } = interaction;
			const { guild } = member;
			const { channel } = member.voice;
      let color = client.settings.get(guild.id, `color`);
      let emoji = client.settings.get(guild.id, `emoji`);
      try {
        let newQueue = client.distube.getQueue(guildId);
        if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
        return interaction.reply({
        embeds: [
        new MessageEmbed()
        .setColor(color)
        .setTitle(`${emoji} LIST OF AVAILABLE FILTERS!`)
			  .setDescription(`
        All available Filters: ${Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ")}
        **NOTE:** All filters, starting with custom are having there own command.\nPlease use them to define what custom amount you want to add **(¬‿¬)**
        `)
        ],
        ephemeral: true
        });
        }
        return interaction.reply({
        embeds: [
        new MessageEmbed()
        .setColor(color)
        .setTitle(`${emoji} LIST OF AVAILABLE FILTERS!`)
        .setDescription(`
        All available Filters: ${Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ")}
        **NOTE:** All filters, starting with custom are having there own command.\nPlease use them to define what custom amount you want to add **(¬‿¬)**
        All current Filters: ${newQueue.filters.map(f => `\`${f}\``).join(", ")}
        `)
        ],
      });
      } catch (e) {
			console.log(e.stack ? e.stack : e)
			interaction.editReply({
			embeds: [
			new MessageEmbed()
			.setColor("#e63064")
			.setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
			.setDescription(`\`\`\`${e.stack.toString().substr(0, 800)}\`\`\``)
			.setFooter("Error in code: Report this error to kotlin0427")
			],
			ephemeral: true
			});
			}
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}
