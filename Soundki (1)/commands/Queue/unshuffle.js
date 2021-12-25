const { MessageEmbed, Message } = require("discord.js");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
	name: "unshuffle",
	category: "Queue",
	aliases: ["mix"],
	usage: "unshuffle",
	description: "Un-shuffles and mixes the music queue",
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
			if(!client.maps.has(`beforeshuffle-${newQueue.id}`)) {
			return message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`The music queue was never shuffled before`)
			.setTitle(`${emoji} QUEUE WAS NOT SHUFFLED`)
			],
			})
			}
			message.react(react);
			newQueue.songs = [newQueue.songs[0], ...client.maps.get(`beforeshuffle-${newQueue.id}`)]
			client.maps.delete(`beforeshuffle-${newQueue.id}`);
			message.reply({
			embeds: [new MessageEmbed()
			.setColor(color)
			.setDescription(`Successfully un-shuffled **\`${newQueue.songs.length}\`** songs`)
			.setTitle(`${emoji} QUEUE WAS UN-SHUFFLED`)
		    ]
			})
			} catch (e) {
			console.log(e.stack ? e.stack : e)
			message.reply({
			embeds: [
			new MessageEmbed()
			.setColor("#e63064")
			.setTitle("<:errorcode:868245243357712384> AN ERROR OCCURED!")
			.setDescription(`\`\`\`${e.stack.toString().substr(0, 800)}\`\`\``)
			.setFooter("Error in code: Report this error to kotlin0427")
			],
			});
			}
		} catch (e) {
			console.log(String(e.stack))
		}
	}
}