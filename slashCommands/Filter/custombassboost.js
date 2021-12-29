const { MessageEmbed, Message } = require("discord.js");
const FiltersSettings = require("../../botconfig/filters.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "custombassboost", 
	description: "Sets a custom Bassboost with Gain!",
	cooldown: 5,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	options: [
		{
			"Integer": {
				name: "gain",
				description: "What Gain should the Bassboost have?",
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
			if (!newQueue || !newQueue.songs || newQueue.songs.length == 0){
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
			let bass_gain = options.getInteger("gain")
			if (bass_gain > 20 || bass_gain < 0) {
			return interaction.reply({
			embeds: [
			new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ADD A BASSBOOST GAIN!`)
			.setDescription(`Please add a Bassboost-Gain between **0** and **20!**`)
			],
			ephemeral: true
			});
			}
			FiltersSettings.custombassboost = `bass=g=${bass_gain},dynaudnorm=f=200`;
			client.distube.filters = FiltersSettings;
			//add old filters so that they get removed 	
			//if it was enabled before then add it
			if (newQueue.filters.includes("custombassboost")) {
			await newQueue.setFilter(["custombassboost"]);
			}
			await newQueue.setFilter(["custombassboost"]);
			interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} BASSBOOST GAIN ADDED!`)
			.setDescription(`Successfully set the Bassboost to **${bass_gain}!**`)
		    ],
			ephemeral: true
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