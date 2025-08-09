## Bot Discord – Complet (Moderare + Muzica + AutoMod)

Bot de Discord functional cu comenzi slash, embed-uri pentru raspunsuri, moderare, muzica (YouTube/Spotify -> YouTube), AutoMod (anti-links, anti-spam) si escaladare automata (timeout/ban).

### 1) Cerinte
- Node.js 18+
- Un bot creat in Discord Developer Portal

### 2) Instalare
```bash
npm install
```

### 3) Configurare .env
1. Copiaza fisierul `.env.example` in `.env`.
2. Completeaza variabilele:
   - `DISCORD_TOKEN` – token-ul botului
   - `CLIENT_ID` – ID-ul aplicatiei botului
   - `GUILD_ID` – optional, ID-ul serverului pentru inregistrare rapida a comenzilor

Pentru a obtine `CLIENT_ID` si a invitat botul pe server:
- Link invitatie (inlocuieste CLIENT_ID):
  `https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=277025508352&scope=bot%20applications.commands`

Nota: Daca folosesti comanda `/say`, asigura-te ca botul are permisiunea de a trimite mesaje in canalul curent.

### 4) Inregistrare comenzi slash
```bash
npm run register
```
- Cu `GUILD_ID` setat, apar instant pe acel server.
- Fara `GUILD_ID`, inregistrarea globala poate dura cateva minute.

### 5) Rulare
```bash
npm run dev   # cu autoreload
# sau
npm start     # fara autoreload
```

### 6) Intent-uri si permisiuni
- Activeaza in Developer Portal: Guild Members Intent (optional), Message Content Intent (daca folosesti comenzi pe text), restul sunt standard.
- Invite URL (automat):
  ```bash
  npm run invite
  ```
  Alege serverul si acorda permisiunile default (incluse pentru moderare si muzica).

### 7) Comenzi principale
- Utilitare: `/ping`, `/help`, `/user`, `/server`, `/avatar`, `/whois`, `/channelinfo`, `/servericon`, `/serverroles`, `/banner`, `/uptime`, `/botinfo`, `/invitelink`, `/quote`, `/emojiinfo`, `/roleinfo`, `/remind`
- Moderare de baza: `/clear`, `/purgeuser`, `/slowmode`, `/lock`, `/unlock`, `/addrole`, `/removerole`, `/timeout`, `/kick`, `/ban`, `/unban`, `/nick`, `/move`
- Avertismente: `/warn`, `/warnings`, `/clearwarn`, `/delwarn`
- AutoMod: `/setlog`, `/antilinks`, `/antispam`, `/settings`, `/escalation`
- Muzica (voice): `/join`, `/play`, `/pause`, `/resume`, `/skip`, `/stop`, `/queue`, `/leave`
- Fun: `/8ball`, `/coinflip`, `/roll`, `/meme`, `/cat`, `/dog`, `/urban`, `/poll`, `/calc`, `/snipe`

Raspunsurile comenzilor sunt trimise public (embed-uri vizibile pentru toti, fara ephemeral).

### 8) Muzica – note
- Necesita prezenta botului intr-un canal vocal: `/join` sau direct `/play` cand esti conectat.
- Suporta link YouTube (video/playlist) si link Spotify (track/playlist/album) mapat la YouTube.
- Daca anumite linkuri YouTube esueaza temporar, incearca cautare text: `/play nume piesa`.

### 9) AutoMod si Escaladare
- Configureaza canalul de loguri: `/setlog #canal`
- Anti-links: `/antilinks on:true`
- Anti-spam: `/antispam on:true limita:5 fereastra:5`
- Escaladare automata (timeout/ban la praguri): `/escalation on:true warn_threshold:3 warn_action:timeout warn_timeout_min:10 spam_threshold:3 spam_action:timeout spam_timeout_min:10`

### 10) Help cu butoane
- `/help` afiseaza un embed cu categorii si butoane (Utilitare, Moderare, Muzica, Fun). Apasa butoanele pentru a naviga intre categorii.

### 11) Probleme cunoscute
- Update-uri YouTube pot impacta streamingul; folosim `@distube/ytdl-core` cu anteturi + fallback `play-dl`.
- Slash-commands globale pot avea delay cateva minute.


