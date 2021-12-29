const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "move",
	category: "Queue",
	usage: "move <WhatSong> <ToWhere>",
	description: "Moves one song to another place",
	cooldown: 10,
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	run: async (client, message, args) => {
		try {
			let prefix = client.settings.get(message.guild.id, "prefix");
			let color = client.settings.get(message.guild.id, `color`);
			let emoji = client.settings.get(message.guild.id, `emoji`);
			let react = client.settings.get(message.guild.id, `react`);
			const { member, guildId, guild } = message;
			const { channel } = member.voice;
			if (!channel) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`You have to be in a voice channel to use this command!`)
			.setTitle(`${emoji} NOT IN A VOICE CHANNEL!`)
			],
			});
			}
			//if user is not in the same voice channel as the bot
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
			if(!newQueue)
			if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) {
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
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ADD A SONG POSITION`)
			.setDescription(`**Usage:** \`${prefix}move <SongPosition> <ToPosition>\``)
			],
			});
			}
			if (!args[1]) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ADD A MOVE POSITION`)
			.setDescription(`**Usage:** \`${prefix}play <SongPosition> <ToPosition>\``)
			],
			});
			}
			let songIndex = Number(args[0]);
			if (!songIndex) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ADD A SONG POSITION NUMBER`)
			.setDescription(`**Usage:** \`${prefix}move <SongPosition> <ToPosition>\``)
			],
			});
			}
			let position = Number(args[1]);
			if (!position) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} ADD A TO MOVE POSITION NUMBER`)
			.setDescription(`**Usage:** \`${prefix}play <SongPosition> <ToPosition>\``)
			],
			});
			}
			if (position >= newQueue.songs.length || position < 0) position = -1;
			if (songIndex > newQueue.songs.length - 1) return message.reply({
			embeds: [
			new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} SONG DOES NOT EXIST`)
			.setDescription(`The last Song in the Queue has the Index: \`${newQueue.songs.length}\``)
			],
			})
			if (position == 0) return message.reply({
			embeds: [
			new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} CANNOT MOVE SONG`)
			.setDescription(`Cannot move song before current playing song!`)
			],
			})
			message.react(react);
			let song = newQueue.songs[songIndex];
			//remove the song
			newQueue.songs.splice(songIndex);
			//Add it to a specific Position
			newQueue.addToQueue(song, position)
			message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setTitle(`${emoji} SONG HAS BEEN MOVED`)
			.setDescription(`Moved **${song.name}** to the **\`${position}th\`**\nPlace right after **${newQueue.songs[position - 1].name}**`)
			]
			});
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
			})
			}
		} catch (e) {
			console.log(String(e.stack))
		}
	}
}
