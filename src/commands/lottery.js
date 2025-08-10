const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

// Configurare loterie
const LOTTERY_TICKET_PRICE = 100;
const LOTTERY_POT_MULTIPLIER = 0.8; // 80% din totalul biletelor merg în pot
const LOTTERY_DRAW_INTERVAL = 24 * 60 * 60 * 1000; // 24 ore

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('lottery')
    .setDescription('Sistem de loterie - cumpără bilete și câștigă!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('buy')
        .setDescription('Cumpără un bilet de loterie')
        .addIntegerOption(option =>
          option
            .setName('tickets')
            .setDescription('Numărul de bilete de cumpărat')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Informații despre loterie')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('draw')
        .setDescription('Desenează câștigătorul (Admin)')
    ),

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;

      if (subcommand === 'buy') {
        await this.buyTickets(interaction, guildId);
      } else if (subcommand === 'info') {
        await this.showLotteryInfo(interaction, guildId);
      } else if (subcommand === 'draw') {
        await this.drawWinner(interaction, guildId);
      }
    } catch (error) {
      console.error('Error in lottery command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la executarea comenzii loterie.', 
        ephemeral: true 
      });
    }
  },

  async buyTickets(interaction, guildId) {
    const ticketCount = interaction.options.getInteger('tickets');
    const totalCost = ticketCount * LOTTERY_TICKET_PRICE;
    const userId = interaction.user.id;

    // Obține utilizatorul
    const user = await getOrCreateUser(userId, guildId, interaction.user.username);

    // Verifică dacă are suficienți coins
    if (user.coins < totalCost) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Coins insuficienți!')
        .setDescription(`Ai nevoie de **${totalCost} coins** pentru ${ticketCount} bilete.\nSoldul tău: **${user.coins} coins**`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Deduce coins-urile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        coins: { decrement: totalCost }
      }
    });

    // Adaugă tranzacția
    await addTransaction(user.id, 'LOTTERY_TICKET', -totalCost, `Bought ${ticketCount} lottery tickets`);

    // Creează biletele în inventar
    for (let i = 0; i < ticketCount; i++) {
      await prisma.inventoryItem.create({
        data: {
          userId: user.id,
          itemName: 'Lottery Ticket',
          quantity: 1
        }
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎫 Bilete de loterie cumpărate!')
      .setDescription(`Ai cumpărat **${ticketCount} bilete** pentru **${totalCost} coins**!`)
      .addFields(
        { name: '🎫 Bilete cumpărate', value: `${ticketCount}`, inline: true },
        { name: '💰 Cost total', value: `${totalCost} coins`, inline: true },
        { name: '🏦 Soldul rămas', value: `${updatedUser.coins} coins`, inline: true }
      )
      .setFooter({ text: 'Baftă la extragere!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async showLotteryInfo(interaction, guildId) {
    // Numără biletele totale
    const totalTickets = await prisma.inventoryItem.count({
      where: {
        itemName: 'Lottery Ticket'
      }
    });

    const totalPot = totalTickets * LOTTERY_TICKET_PRICE * LOTTERY_POT_MULTIPLIER;

    const embed = new EmbedBuilder()
      .setColor('#ffd700')
      .setTitle('🎰 Informații Loterie')
      .setDescription('Sistemul de loterie permite utilizatorilor să cumpere bilete și să câștige coins!')
      .addFields(
        { name: '🎫 Bilete vândute', value: `${totalTickets}`, inline: true },
        { name: '💰 Pot total', value: `${totalPot} coins`, inline: true },
        { name: '💵 Preț bilet', value: `${LOTTERY_TICKET_PRICE} coins`, inline: true },
        { name: '📅 Extragere', value: 'Odată la 24 ore', inline: true },
        { name: '🎁 Câștig', value: '80% din totalul biletelor', inline: true },
        { name: '📝 Comandă', value: '`/lottery buy <număr>`', inline: true }
      )
      .setFooter({ text: 'Baftă la extragere!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async drawWinner(interaction, guildId) {
    // Verifică dacă este admin
    if (!interaction.member.permissions.has('Administrator')) {
      await interaction.reply({ 
        content: 'Nu ai permisiunea să desenezi câștigătorul!', 
        ephemeral: true 
      });
      return;
    }

    // Numără biletele totale
    const totalTickets = await prisma.inventoryItem.count({
      where: {
        itemName: 'Lottery Ticket'
      }
    });

    if (totalTickets === 0) {
      await interaction.reply({ 
        content: 'Nu există bilete de loterie pentru extragere!', 
        ephemeral: true 
      });
      return;
    }

    // Alege un câștigător random
    const randomTicket = Math.floor(Math.random() * totalTickets);
    let currentCount = 0;
    let winner = null;

    const tickets = await prisma.inventoryItem.findMany({
      where: {
        itemName: 'Lottery Ticket'
      },
      include: {
        user: true
      }
    });

    for (const ticket of tickets) {
      currentCount += ticket.quantity;
      if (currentCount > randomTicket) {
        winner = ticket.user;
        break;
      }
    }

    if (!winner) {
      await interaction.reply({ 
        content: 'Eroare la desenarea câștigătorului!', 
        ephemeral: true 
      });
      return;
    }

    // Calculează premiul
    const totalPot = totalTickets * LOTTERY_TICKET_PRICE * LOTTERY_POT_MULTIPLIER;

    // Dă premiul câștigătorului
    await prisma.user.update({
      where: { id: winner.id },
      data: {
        coins: { increment: totalPot }
      }
    });

    // Adaugă tranzacția
    await addTransaction(winner.id, 'LOTTERY_WIN', totalPot, 'Won lottery');

    // Șterge toate biletele
    await prisma.inventoryItem.deleteMany({
      where: {
        itemName: 'Lottery Ticket'
      }
    });

    const embed = new EmbedBuilder()
      .setColor('#ffd700')
      .setTitle('🎉 Câștigătorul loteriei!')
      .setDescription(`🎊 **${winner.username}** a câștigat loteria!`)
      .addFields(
        { name: '🏆 Câștigător', value: `<@${winner.discordId}>`, inline: true },
        { name: '💰 Premiul', value: `${totalPot} coins`, inline: true },
        { name: '🎫 Bilete totale', value: `${totalTickets}`, inline: true }
      )
      .setFooter({ text: 'Felicitări câștigătorului!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
