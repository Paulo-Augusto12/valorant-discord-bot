const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Confira a latência do bot"),

  async execute(interaction) {
    const embed = () => {
      return new EmbedBuilder()
        .setColor("Green")
        .setTitle('Latência de bombin')
        .setAuthor({
          name: interaction.user.username,
          iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
        })
        .addFields({
          name: "Latência",
          value: `${Date.now() - interaction.createdTimestamp}ms`,
        });
    };
    await interaction.reply({ embeds: [embed()] });
  },
};
