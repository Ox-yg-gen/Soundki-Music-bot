const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "playtop",
	description: "Plays a song or playlist and adds it to the top!",
	cooldown: 2,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	options: [
		{
			"String": {
				name: "song",
				description: "Which song do you want to add?",
				required: true
			}
		},
	],
	run: async (client, interaction) => {
		try {
			const { member, channelId, guildId, options } = interaction;
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
			if (channel.userLimit != 0 && channel.full)
			return interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} VOICE CHANNEL LIMIT!`)
			.setDescription(`Your Voice Channel is full and I'm unable to join!`)
			],
			ephemeral: true
			});
			if (channel.guild.me.voice.channel && channel.guild.me.voice.channel.id != channel.id) {
			return interaction.reply({
		    embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ALREADY IN A VOICE CHANNEL!`)
			.setDescription(`Oops it seems I'm already connected to another channel`)
			],
			ephemeral: true
			});
			}
			const Text = options.getString("song"); //same as in StringChoices //RETURNS STRING 
			//update it without a response!
			await interaction.reply({ content: `${emoji} **Searching...** \`${Text}\``, ephemeral: true });
			try {
			let queue = client.distube.getQueue(guildId)
			let options = { member: member, unshift: true }
			if (!queue) options.textChannel = guild.channels.cache.get(channelId)
			if (queue) {
			if (check_if_dj(client, member, queue.songs[0])) {
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
			}
			await client.distube.playVoiceChannel(channel, Text, options)
			//Edit the reply
			interaction.editReply({ content: `${queue?.songs?.length > 0 ? " " + emoji + "  **Added to the top of the queue**" : " " + emoji + "  **Now Playing:**"} \`${Text}\``, ephemeral: true });
			} catch (e) {
			console.log(e.stack ? e.stack : e);
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