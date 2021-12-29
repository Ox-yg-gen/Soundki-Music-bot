const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require("discord.js");
module.exports = {
	name: "queue",
	category: "Queue",
	aliases: ["queuelist", "musiclist"],
	usage: "queue",
	description: "Lists of songs in the current queue",
	cooldown: 10,
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
				if (!newQueue || !newQueue.songs || newQueue.songs.length == 0){
				return message.reply({
				embeds: [new MessageEmbed()
				.setColor(color)
				.setDescription(`There's currently nothing playing right now`)
				.setTitle(`${emoji} NOTHING PLAYING!`)
				],
				});
				}
				message.react(react);
				let embeds = [];
				let k = 10;
				let theSongs = newQueue.songs;
				//defining each Pages
				for (let i = 0; i < theSongs.length; i += 10) {
				let qus = theSongs;
				const current = qus.slice(i, k)
				let j = i;
				const info = current.map((track) => `> **${j++} -** [\`${String(track.name).replace(/\[/igu, "{").replace(/\]/igu, "}").substr(0, 60)}\`](${track.url}) - \`${track.formattedDuration}\``).join("\n")
				const embed = new MessageEmbed()
				.setColor(color)
				.setDescription(`${info}`)
				if (i < 10) {
				embed.setTitle(`${emoji} TOP ${theSongs.length > 50 ? 50 : theSongs.length} | QUEUE OF ${guild.name.toUpperCase()}`)
				embed.setDescription(`
				**Current Song:**\n> [\`${theSongs[0].name.replace(/\[/igu, "{").replace(/\]/igu, "}")}\`](${theSongs[0].url})\n\n${info}
				`)
				}
				embeds.push(embed);
				k += 10; //Raise k to 10
				}
				embeds[embeds.length - 1] = embeds[embeds.length - 1]
				.setFooter(`${client.user.username} has ${theSongs.length} songs in the queue | Duration: ${newQueue.formattedDuration}`, client.user.displayAvatarURL())
				let pages = []
				for (let i = 0; i < embeds.length; i += 3) {
				pages.push(embeds.slice(i, i + 3));
				}
				pages = pages.slice(0, 24)
				const Menu = new MessageSelectMenu()
				.setCustomId("queuepages")
				.setPlaceholder("Select a Page")
				.addOptions([
				pages.map((pages, index) => {
				let Obj = {};
				Obj.label = `Page ${index}`
				Obj.value = `${index}`;
				Obj.description = `Shows the ${index}/${pages.length - 1} Page!`
				return Obj;
				})
				])
				const row = new MessageActionRow().addComponents([Menu])
				message.reply({
					embeds: [embeds[0]],
					components: [row],
				});
				//Event
				client.on('interactionCreate', (i) => {
				if (!i.isSelectMenu()) return;
				if (i.customId == "queuepages" && i.applicationId == client.user.id) {
				i.reply({
				embeds: pages[Number(i.values[0])],
				}).catch(e => {})
				}
				});
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
