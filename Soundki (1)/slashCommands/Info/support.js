module.exports = {
  name: "support",
  cooldown: 1,
  description: "Sends a Link of the Support Server",
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      interaction.reply({
        ephemeral: true,
        content: "https://discord.gg/zstbC5ftPR"
      });
    } catch (e) {
      console.log(String(e.stack))
    }
  }
}
