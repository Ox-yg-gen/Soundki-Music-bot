const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "move",
	description: "Moves one song to another place",
	cooldown: 10,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	options: [
		{
			"Integer": {
				name: "song",
				description: "What song index do you want to remove?",
				required: true
			}
		},
		{
			"Integer": {
				name: "where",
				description: "To where should i move the song? (1 == after current, -1 == Top)",
				required: true
			}
		},
	],
	run: async (client, interaction) => {
		try {
			const { member, guildId } = interaction;
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
			let songIndex = options.getInteger("song");
			let position = options.getInteger("where");
			if (position >= newQueue.songs.length || position < 0) position = -1;
			if (songIndex > newQueue.songs.length - 1) return interaction.reply({
			embeds: [
			new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} SONG DOES NOT EXIST`)
			.setDescription(`The last song in the queue has the Index: \`${newQueue.songs.length}\``)
			],
			ephemeral: true
			});
			if (position == 0) {
			return interaction.reply({
		    embeds: [
			new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} CANNOT MOVE SONG`)
			.setDescription(`Cannot move song before current playing song!`)
			],
			ephemeral: true
			});
			}
			let song = newQueue.songs[songIndex];
			//remove the song
			newQueue.songs.splice(songIndex);
			//Add it to a specific Position
			newQueue.addToQueue(song, position)
			interaction.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} SONG HAS BEEN MOVED`)
			.setDescription(`Moved **${song.name}** to the **\`${position}th\`**\nPlace right after **${newQueue.songs[position - 1].name}**`)
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
