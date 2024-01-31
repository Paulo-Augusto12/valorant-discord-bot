const { default: axios } = require("axios");
const {
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
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

      const agentAbilitiesDisplay = new ButtonBuilder()
        .setCustomId("abilities")
        .setLabel(`Habilidades do(a) agente ${agent.displayName}`)
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🛠️");

      const rows = new ActionRowBuilder().addComponents(agentAbilitiesDisplay);

      const embed = () =>
        new EmbedBuilder()
          .setTitle(agent.displayName)
          .setDescription(agent.description)

          .setImage(agent.fullPortrait)
          .setAuthor({
            name: interaction.user.username,
            iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`,
          })
          .setURL(
            `https://playvalorant.com/pt-br/agents/${String(
              agent.displayName
            ).toLowerCase()}/`
          )
          .setThumbnail(agent.displayIcon)
          .setColor("Green")
          .setTimestamp(new Date().getTime());

      const agentResponse = await option.reply({
        embeds: [embed()],
        components: [rows],
      });
      const collectorFilter = (i) => i.user.id === interaction.user.id;

      try {
        const sent = await response.awaitMessageComponent({
          filter: collectorFilter,
        });

        return await sent.update({
          embeds: [
            new EmbedBuilder()
              .setTitle(agent.displayName)
              .setColor("Green")
              .setDescription(
                `${agent.displayName} é um (uma) ${agent.role.displayName}. ${agent.role.description}`
              )
              .setThumbnail(agent.displayIcon)
              .addFields({ name: "Função", value: agent.role.displayName })
              .addFields(...abilities)
              .setFooter({
                text: agent.role.displayName,
                iconURL: agent.role.displayIcon,
              })
              .setURL(
                `https://playvalorant.com/pt-br/agents/${String(
                  agent.displayName
                ).toLowerCase()}/`
              ),
          ],
          components: [],
        });
      } catch (err) {}
    } catch (err) {
      console.log(err);
    }
  },
};
