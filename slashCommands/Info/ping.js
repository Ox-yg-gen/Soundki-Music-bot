module.exports = {
	name: "ping",
	description: "Gives you information on how fast the Bot is", //the command description for Slash Command Overview
	cooldown: 1,
	memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
	requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
	alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
	options: [
		{
			"StringChoices": {
				name: "type",
				description: "What ping do you want to get?",
				required: false,
				choices: [
					["Botping"],
					["Api"]
				]
			}
		},
	],
	run: async (client, interaction) => {
		try {
			const { member, options, createdTimestamp } = interaction;
			let pointer = client.settings.get(member.guild.id, `pointer`);
			const StringOption = options.getString("type");
			if (StringOption) {
				if (StringOption == "Botping") {
					await interaction.reply({
						ephemeral: true,
						content: `${pointer} Getting the Bot Ping...`,
						ephemeral: true
					});
					interaction.editReply({
						ephemeral: true,
						content: `**Bot Ping:** \`${Math.floor((Date.now() - createdTimestamp) - 2 * Math.floor(client.ws.ping))} ms\``,
						ephemeral: true
					})
				}
				//Other Option is API so we are alright
				else {
					interaction.reply({
						ephemeral: true,
						content: `**Api Ping:** \`${Math.floor(client.ws.ping)} ms\``,
						ephemeral: true
					})
				}
			} else {
				await interaction.reply({
					ephemeral: true,
					content: `${pointer} Getting the Bot Ping...`,
					ephemeral: true
				});
				interaction.editReply({
					ephemeral: true,
					content: `**Bot Ping:** \`${Math.floor((Date.now() - createdTimestamp) - 2 * Math.floor(client.ws.ping))} ms\`\n\n${pointer} Api Ping: \`${Math.floor(client.ws.ping)} ms\``,
					ephemeral: true
				})
			}
		} catch (e) {
			console.log(String(e.stack))
		}
	}
}