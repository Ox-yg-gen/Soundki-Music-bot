const { MessageEmbed, MessageButton } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions")
const FiltersSettings = require("../../botconfig/filters.json");
module.exports = {
	name: "custombassboost",
	category: "Filter",
	usage: "custombassboost <Gain (0-20)>",
	aliases: ["bassboost", "bb", "bass", "custombass", "cbassboost", "cbass", "cbb", "custombb"],
	description: "Sets a custom Bassboost with Gain!",
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
			if (!channel) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You have to be in a voice channel to use this command!`)
			.setTitle(`${emoji} NOT IN A VOICE CHANNEL!`)
			],
			});
			}
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You must be in the same voice channel as me - <#${guild.me.voice.channel.id}>`)
			.setTitle(`${emoji} NOT IN SAME VOICE!`)
			],
			});
			}
			try {
				let newQueue = client.distube.getQueue(guildId);
				if (!newQueue || !newQueue.songs || newQueue.songs.length == 0){
				return message.reply({
				embeds: [new MessageEmbed()
				.setColor(color)
				.setDescription(`There's currently nothing playing right now`)
				.setTitle(`${emoji} NOTHING PLAYING!`)
				],
				});
				}
				if (check_if_dj(client, member, newQueue.songs[0])) {
				return message.reply({
				embeds: [new MessageEmbed()
				.setColor(color)
				.setTitle(`${emoji} NOT THE SONG AUTHOR!`)
				.setDescription(`
				Hmm... You don't seem to be a DJ or the song author
				You need this **dj roles:** ${check_if_dj(client, member, newQueue.songs[0])}
				`)
				],
				});
				}
				if (!args[0]) {
					return message.reply({
					embeds: [
					new MessageEmbed()
					.setColor(color)
					.setTitle(`${emoji} ADD A BASSBOOST GAIN!`)
					.setDescription(`Please add a Bassboost-Gain between **0** and **20!**`)
					],
					})
				}
				let bass_gain = parseInt(args[0])
				if (bass_gain > 20 || bass_gain < 0) {
					return message.reply({
						embeds: [
							new MessageEmbed()
							.setColor(color)
							.setTitle(`${emoji} INVALID BASSBOOST GAIN!`)
							.setDescription(`The Bassboost Gain must be between **0** and **20!**`)
						],
					})
				}
				FiltersSettings.custombassboost = `bass=g=${bass_gain},dynaudnorm=f=200`;
				client.distube.filters = FiltersSettings;
				//add old filters so that they get removed 	
				//if it was enabled before then add it
				if (newQueue.filters.includes("custombassboost")) {
					await newQueue.setFilter(["custombassboost"]);
				}
				message.react(react);
				await newQueue.setFilter(["custombassboost"]);
				message.reply({
				embeds: [new MessageEmbed()
				.setColor(color)
				.setTitle(`${emoji} BASSBOOST GAIN ADDED!`)
				.setDescription(`Successfully set the Bassboost to **${bass_gain}!**`)]
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