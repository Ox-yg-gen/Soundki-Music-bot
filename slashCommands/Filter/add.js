const { MessageEmbed, Message } = require("discord.js");
const FiltersSettings = require("../../botconfig/filters.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "add",
	description: "Add a filter to the filters",
	cooldown: 5,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	options: [ 
		{
			"String": {
				name: "filters",
				description: "Add all filters with a space between, to add!",
				required: true
			}
		}, 
	],
	run: async (client, interaction) => {
		try {
			const { member, guildId, options } = interaction;
			const { guild } = member;
			const { channel } = member.voice;
			let color = client.settings.get(guild.id, `color`);
			let emoji = client.settings.get(guild.id, `emoji`);
			if (!channel) {
				return interaction.reply({
				embeds: [new MessageEmbed()
				.setColor(color)
				.setDescription(`You have to be in a voice channel to use this command!`)
				.setTitle(`${emoji} NOT IN A VOICE CHANNEL!`)
				],
				ephemeral: true
				});
				}
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You must be in the same voice channel as me - <#${guild.me.voice.channel.id}>`)
			.setTitle(`${emoji} NOT IN SAME VOICE!`)
			],
			ephemeral: true
			});
			}
			try {
			let newQueue = client.distube.getQueue(guildId);
			if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`There's currently nothing playing right now`)
			.setTitle(`${emoji} NOTHING PLAYING!`)
			],
			ephemeral: true
			});
			}
			if (check_if_dj(client, member, newQueue.songs[0])) {
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} NOT THE SONG AUTHOR!`)
			.setDescription(`
			Hmm... You don't seem to be a DJ or the song author
			You need this **dj roles:** ${check_if_dj(client, member, newQueue.songs[0])}
			`)
			],
			ephemeral: true
			});
			}
			let filters = options.getString("filters").toLowerCase().split(" ");
			if (!filters) filters = [options.getString("filters").toLowerCase()]
			if (filters.some(a => !FiltersSettings[a])) {
			return interaction.reply({
			embeds: [
			new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ONE FILTER IS INVALID!`)
			.setDescription(`
			To define Multiple default Filters add a SPACE (" ") in between! them
			All Valid Filters: ${Object.keys(FiltersSettings).map(f => `\`${f}\``).join(", ")}
			NOTE: All filters, starting with custom are having there own Command, please use them to define what custom amount u want!
			`)
			],
			ephemeral: true
			});
			}
			let toAdded = [];
			//add new filters
			filters.forEach((f) => {
			if (!newQueue.filters.includes(f)) {
			toAdded.push(f)
			}
			})
			if (!toAdded || toAdded.length == 0) {
			return interaction.reply({
			embeds: [
			new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} FILTER NOT IN THE FILTERS LIST!`)
			.setDescription(`
			You did not add a filter, which is not in the Filters yet.
			All current filters: ${newQueue.filters.map(f => `\`${f}\``).join(", ")}
			`)
			],
			ephemeral: true
			});
			}
			await newQueue.setFilter(toAdded);
			interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} FILTER ADDED!`)
			.setDescription(`**Added \`${toAdded.length}\` ${toAdded.length == filters.length ? "Filters": `of ${filters.length} Filters! The Rest was already a part of the Filters!`}**`)
			],
			ephemeral: true
			})
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