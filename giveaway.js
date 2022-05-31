const { EmbedBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js');
const { ApplicationCommandType, ApplicationCommandOptionType, ChannelType } = require('discord.js');
const Discord = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "giveaway",
  description: 'Crie um sorteio com as pessoas de um canal de voz ou texto.',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'canal',
      type: ApplicationCommandOptionType.Channel,
      description: 'Escolha um canal de voz para o sorteio.',
      required: true
    },
    {
      name: 'prêmio',
      type: ApplicationCommandOptionType.String,
      description: 'Escolha um prêmio para o sorteio.',
      required: true
    },
    {
      name: 'tempo',
      type: ApplicationCommandOptionType.String,
      description: 'Escolha uma duração para o sorteio.',
      required: true
    }
  ],

  run: async (client, interaction, args) => {

    if (!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: 'Você não possui permissão para usar este comando :c', ephemeral: true })

    let channel = interaction.options.getChannel('canal')

    let embedchannelerror = new Discord.EmbedBuilder()
        .setColor('FF3232')
        .setDescription(`**Erro**\n\n> O **canal** fornecido não é válido\n\n> **Canal** fornecido: **<#${channel.id}>**\n\n> Apenas canais de **texto** e **voz** são válidos.`)

    if (![ChannelType.GuildVoice, ChannelType.GuildText].includes(channel.type)) return interaction.reply({embeds: [embedchannelerror], ephemeral: true})


    const buttonlink = new Discord.ActionRowBuilder().addComponents([
      new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
        .setLabel("Link do sorteio")
        .setEmoji(`🎉`)
        .setDisabled(false)
    ]);




    const server = interaction.guild.id

    let prize = interaction.options.getString('prêmio')

    let tempo = interaction.options.getString('tempo')

    let tempoms = ms(tempo)

    let embedtimeerror = new Discord.EmbedBuilder()
        .setColor('FF3232')
        .setDescription(`**Erro**\n\n> O tempo é **invalido**\n\n> **Tempo** fornecido: **${tempo}**\n\n> Medidas de tempo **válidas**:\n> **s** -> segundos, exemplo: **(10s)**\n> **m** -> minutos, exemplo: **(10m)**\n> **h** -> horas, exemplo: **(10h)**\n> **d** -> dias, exemplo: **(10d)**`)

    if(tempoms === undefined) return interaction.reply({embeds: [embedtimeerror], ephemeral: true})

    let embedtimemax = new Discord.EmbedBuilder()
        .setColor('FF3232')
        .setDescription(`**Erro**\n\n> O tempo passou do limite **permitido**\n\n> **Tempo** fornecido: **${tempo}**\n\n> Tempo **máximo** permitido: **20 Dias**`)


    if(tempoms > 1728000000) return interaction.reply({embeds: [embedtimemax], ephemeral: true})
 

    let Embed = new Discord.EmbedBuilder()
      .setTitle(`🎉  SORTEIO`)
      .setDescription(`**Temos um novo sorteio por aqui!** \n\n **Sorteio** feito por: ${interaction.user} \n\n**Prêmio** do sorteio: **${prize}** \n\n**Tempo** de sorteio: **${tempo}**`)
      .setTimestamp(Date.now() + ms(tempo))
      .setFooter({ text: 'O sorteio termina' })
      .setColor(`FF8AE5`);


    let embedsuccess = new Discord.EmbedBuilder()
      .setColor('FF8AE5')
      .setDescription('> 🎉 **|** O sorteio foi criado com **sucesso**')

    const canalinteraction = interaction.channel.id

    let msg = await interaction.channel.send({ embeds: [Embed], components: [buttonlink] });
    await interaction.reply({ embeds: [embedsuccess], ephemeral: true })

    setTimeout(() => {

      const a = msg.channel.messages.cache.get(msg.id)


      if (!a) {
        return
      }


      let winner = interaction.guild.channels.cache.get(channel.id).members.random()

      let embednowinner = new Discord.EmbedBuilder()
        .setColor("FF3232")
        .setDescription(`> **Sorteio**\n\n> Não houve nenhum **ganhador**.`)

      if (!winner) return interaction.channel.send({ embeds: [embednowinner] })

      let embednochannel = new Discord.EmbedBuilder()
        .setColor("FF3232")
        .setDescription(`> **Sorteio**\n\n> O canal do sorteio não foi encontrado.`)

      if (!channel) return interaction.channel.send({ embeds: [embednochannel] })

      if (!canalinteraction) return


      const buttonlink = new Discord.ActionRowBuilder().addComponents([
        new Discord.ButtonBuilder()
          .setStyle(Discord.ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
          .setLabel("O sorteio acabou")
          .setEmoji(`🎉`)
          .setDisabled(true)
      ]);

      const embedganhador = new Discord.EmbedBuilder()
        .setTitle(`🎉  O SORTEIO ACABOU`)
        .setDescription(`**Sorteio** feito por: ${interaction.user} \n\n**Prêmio** do sorteio: **${prize}** \n\n**Ganhador** do sorteio: **${winner}**`)
        .setTimestamp(Date.now())
        .setFooter({ text: `Ganhador do sorteio: ${winner.user.username}` })
        .setColor(`FF8AE5`);

      msg.edit({ embeds: [embedganhador], components: [buttonlink] });
    }, ms(tempo));
  }
}
