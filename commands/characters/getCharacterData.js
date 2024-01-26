const { default: axios } = require("axios");
const {
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");

async function getValorantCharacters() {
  try {
    const { data } = await axios.get(
      "https://valorant-api.com/v1/agents?isPlayable=true"
    );

    const agents = data.data.map((item) => {
      return { name: item.displayName, id: item.uuid };
    });

    return agents.map((agent) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(agent.name)
        .setValue(agent.id)
    );
  } catch (err) {}
}

async function getValorantCharacterData(id) {
  try {
    const { data } = await axios.get(
      `https://valorant-api.com/v1/agents/${id}?language=pt-BR`
    );

    return data.data;
  } catch (err) {
    console.error(data);
  }
}
module.exports = {
  data: new SlashCommandBuilder()
    .setName("val-character")
    .setDescription("Confira dados sobre um agente"),

  async execute(interaction) {
    const agentOptions = await getValorantCharacters();
    const select = new StringSelectMenuBuilder()
      .setCustomId("character")
      .setPlaceholder(
        "Escolha um agente para que seus dados sejam consultados e retornados"
      )
      .addOptions(...agentOptions);

    const row = new ActionRowBuilder().addComponents(select);

    const response = await interaction.reply({
      content: "Escolha um agente",
      components: [row],
    });

    try {
      const option = await response.awaitMessageComponent();

      const agent = await getValorantCharacterData(option.values[0]);
      const abilities = agent.abilities.map((ability) => {
        return { name: ability.displayName, value: ability.description };
      });

      const embed = () =>
        new EmbedBuilder()
          .setTitle(`Confira dados do(a) agente ${agent.displayName}`)
          .setDescription(agent.description)
          .addFields(...abilities)
          .setImage(agent.fullPortrait)
          .setAuthor({
            name: interaction.user.username,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
          })
          .setColor("Green")
          .setTimestamp(new Date().getTime());

      return await option.reply({ embeds: [embed()] });
    } catch (err) {
      console.log(err);
    }
  },
};
