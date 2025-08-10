## Bot Discord – Complet (Moderare + Muzica + AutoMod + Dashboard + Economie + Jocuri)

Bot de Discord functional cu comenzi slash, embed-uri pentru raspunsuri, moderare, muzica (YouTube/Spotify -> YouTube), AutoMod (anti-links, anti-spam), escaladare automata (timeout/ban), **dashboard web (wip)**, **sistem de economie**, **jocuri de noroc**, si multe alte functionalitati avansate.

### 1) Cerinte
- Node.js 18+
- Un bot creat in Discord Developer Portal
- **Prisma CLI** (pentru baza de date)
- **Discord OAuth2** configurat pentru dashboard

### 2) Instalare
```bash
npm install
npm install -g prisma
```

### 3) Configurare baza de date
```bash
# Generare client Prisma
npm run db:generate

# Sincronizare schema cu baza de date
npm run db:push

# Sau pentru migrari
npm run db:migrate

# Deschide Prisma Studio pentru vizualizare
npm run db:studio
```

### 4) Configurare .env
1. Copiaza fisierul `.env.example` in `.env`.
2. Completeaza variabilele:
   - `DISCORD_TOKEN` – token-ul botului
   - `CLIENT_ID` – ID-ul aplicatiei botului
   - `GUILD_ID` – optional, ID-ul serverului pentru inregistrare rapida a comenzilor
   - **`CLIENT_SECRET`** – secret-ul aplicatiei Discord (pentru dashboard)
   - **`CALLBACK_URL`** – URL-ul de callback pentru OAuth2 (pentru dashboard)
   - **`SESSION_SECRET`** – secret pentru sesiuni (pentru dashboard)

Pentru a obtine `CLIENT_ID` si a invitat botul pe server:
- Link invitatie (inlocuieste CLIENT_ID):
  `https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=277025508352&scope=bot%20applications.commands`

### 5) Inregistrare comenzi slash
```bash
npm run register
```
- Cu `GUILD_ID` setat, apar instant pe acel server.
- Fara `GUILD_ID`, inregistrarea globala poate dura cateva minute.

### 6) Rulare
```bash
# Bot principal
npm run dev        # cu autoreload
npm start          # fara autoreload

# Dashboard web
npm run dashboard      # productie
npm run dev:dashboard # cu autoreload
```

### 7) Intent-uri si permisiuni
- Activeaza in Developer Portal: Guild Members Intent (optional), Message Content Intent (daca folosesti comenzi pe text), restul sunt standard.
- Invite URL (automat):
  ```bash
  npm run invite
  ```
  Alege serverul si acorda permisiunile default (incluse pentru moderare si muzica).

### 8) Comenzi principale

#### **Utilitare**
- `/ping`, `/help`, `/user`, `/server`, `/avatar`, `/whois`, `/channelinfo`, `/servericon`, `/serverroles`, `/banner`, `/uptime`, `/botinfo`, `/invitelink`, `/quote`, `/emojiinfo`, `/roleinfo`, `/remind`, `/reminder`, `/translate`, `/weather`, `/urban`

#### **Moderare de baza**
- `/clear`, `/purgeuser`, `/slowmode`, `/lock`, `/unlock`, `/addrole`, `/removerole`, `/timeout`, `/kick`, `/ban`, `/unban`, `/nick`, `/move`, `/escalation`

#### **Avertismente si sistem de moderare avansat**
- `/warn`, `/warnings`, `/clearwarn`, `/delwarn`
- **AutoMod**: `/setlog`, `/antilinks`, `/antispam`, `/settings`, `/escalation`
- **Sistem de escaladare automata**: timeout/ban la praguri configurate

#### **Muzica (voice)**
- `/join`, `/play`, `/pause`, `/resume`, `/skip`, `/stop`, `/queue`, `/leave`
- Suporta YouTube (video/playlist) si Spotify (track/playlist/album) mapat la YouTube

#### **Sistem de economie complet** 🆕
- `/balance` – verifica soldul
- `/daily` – primeste bonus zilnic
- `/weekly` – primeste bonus saptamanal
- `/work` – lucreaza pentru bani
- `/transfer` – transfera bani catre alti utilizatori
- `/deposit` – depune bani in banca
- `/withdraw` – retrage bani din banca
- `/rob` – incearca sa furi bani de la alti utilizatori
- `/leaderboard` – clasamentul celor mai bogati
- `/inventory` – inventarul cu obiecte

#### **Jocuri de noroc** 🆕
- `/slots` – jocul de sloturi cu 3 rotiri
- `/coinflip` – aruncare moneda
- `/roll` – aruncare zaruri
- `/gamble` – joc de risc cu bani
- `/lottery` – loterie cu tickete

#### **Fun si utilitare**
- `/8ball`, `/meme`, `/cat`, `/dog`, `/poll`, `/quickpoll`, `/calc`, `/snipe`, `/customembed`

### 9) **Dashboard Web (WIP)** 🆕

#### **Accesare**
- Rulare: `npm run dashboard` sau `npm run dev:dashboard`
- Acces: `http://localhost:30001` (port configurat automat)
- Autentificare prin Discord OAuth2

#### **Functionalitati Dashboard**
- **Autentificare securizata** cu Discord
- **Lista serverelor** accesibile utilizatorului
- **Gestionare server** individual cu statistici detaliate
- **Editor de comenzi** pentru personalizare
- **Editor de bot** pentru configurari
- **Statistici server** (membri, canale, roluri)
- **Gestionare comenzi** si permisiuni
- **Interfata moderna** cu Tailwind CSS

#### **Rute Dashboard**
- `/` – pagina principala
- `/login` – autentificare Discord
- `/dashboard` – lista serverelor
- `/dashboard/guild/:guildId` – gestionare server specific
- `/bot-editor` – editor configurari bot
- `/command-editor` – editor comenzi personalizate

### 10) **Sistem de economie avansat** 🆕

#### **Monede si tranzactii**
- Sistem de monede virtuale cu baza de date Prisma
- Tranzactii securizate intre utilizatori
- Sistem bancar cu depuneri si retrageri
- Bonusuri zilnice si saptamanale
- Sistem de munca pentru castiguri

#### **Jocuri si activitati**
- **Sloturi** cu 3 rotiri si simboluri
- **Loteria** cu tickete si castiguri
- **Jocuri de noroc** cu risc si castig
- **Sistem de furt** cu risc de pedeapsa

#### **Clasamente si competitie**
- Leaderboard pentru cei mai bogati
- Inventar cu obiecte si colectii
- Sistem de transfer intre utilizatori

### 11) **AutoMod si Escaladare avansata**

#### **Configurare**
- Canal de loguri: `/setlog #canal`
- Anti-links: `/antilinks on:true`
- Anti-spam: `/antispam on:true limita:5 fereastra:5`
- Escaladare automata: `/escalation on:true warn_threshold:3 warn_action:timeout warn_timeout_min:10 spam_threshold:3 spam_action:timeout spam_timeout_min:10`

#### **Sistem de escaladare**
- Avertismente automate la praguri configurate
- Timeout progresiv pentru utilizatori problematici
- Ban automat pentru utilizatori cu multe avertismente
- Loguri detaliate pentru toate actiunile

### 12) **Help cu butoane interactive**
- `/help` afiseaza un embed cu categorii si butoane
- Navigare intre categorii: Utilitare, Moderare, Muzica, Fun, Economie, Jocuri
- Interfata moderna cu butoane Discord

### 13) **Muzica – note tehnice**
- Necesita prezenta botului intr-un canal vocal: `/join` sau direct `/play` cand esti conectat
- Suporta link YouTube (video/playlist) si link Spotify (track/playlist/album) mapat la YouTube
- Daca anumite linkuri YouTube esueaza temporar, incearca cautare text: `/play nume piesa`
- Foloseste `@distube/ytdl-core` cu anteturi + fallback `play-dl`

### 14) **Arhitectura si tehnologii**

#### **Backend**
- **Discord.js v14** cu slash commands
- **Express.js** pentru dashboard web
- **Prisma ORM** cu SQLite pentru baza de date
- **Passport.js** cu DiscordStrategy pentru autentificare
- **EJS templating** pentru interfata dashboard

#### **Frontend Dashboard**
- **Tailwind CSS** pentru stilizare
- **JavaScript vanilla** pentru interactivitate
- **Font Awesome** pentru iconuri
- **Responsive design** pentru toate dispozitivele

#### **Baza de date**
- **SQLite** cu Prisma ORM
- **Schema relationala** pentru utilizatori, economie, jocuri
- **Migrari automate** pentru actualizari schema

### 15) **Probleme cunoscute si solutii**
- **Update-uri YouTube** pot impacta streamingul; folosim `@distube/ytdl-core` cu anteturi + fallback `play-dl`
- **Slash-commands globale** pot avea delay cateva minute
- **Portul dashboard** se configureaza automat daca 3000 este ocupat
- **Sesiunile Discord** expira la logout, necesita reautentificare

### 16) **Dezvoltare si contributii**

#### **Scripts disponibile**
```bash
npm run dev              # Bot cu autoreload
npm run dashboard        # Dashboard productie
npm run dev:dashboard    # Dashboard cu autoreload
npm run register         # Inregistrare comenzi
npm run invite           # Generare link invitatie
npm run db:generate      # Generare client Prisma
npm run db:push          # Sincronizare schema
npm run db:migrate       # Migrari baza de date
npm run db:studio        # Deschide Prisma Studio
```

#### **Structura proiect**
```
src/
├── commands/           # Comenzi slash
├── dashboard/          # Dashboard web
├── music/             # Sistem muzica
├── utils/             # Utilitare si helperi
├── data/              # Configurari si baza de date
└── index.js           # Punct de intrare bot
```

### 17) **Actualizari recente si implementari noi**

#### **Dashboard Web** (WIP)
- ✅ Interfata web completa cu autentificare Discord
- ✅ Gestionare servere si statistici
- ✅ Editor de comenzi si configurari
- ✅ Design modern cu Tailwind CSS

#### **Sistem Economie**
- ✅ Monede virtuale cu baza de date
- ✅ Tranzactii intre utilizatori
- ✅ Bonusuri zilnice si saptamanale
- ✅ Sistem bancar complet

#### **Jocuri si Activitate**
- ✅ Sloturi cu 3 rotiri
- ✅ Loteria cu tickete
- ✅ Jocuri de noroc
- ✅ Sistem de munca

#### **AutoMod Avansat**
- ✅ Escaladare automata
- ✅ Sistem de avertismente
- ✅ Loguri detaliate
- ✅ Configurari flexibile

#### **Muzica si Utilitare**
- ✅ Suport YouTube si Spotify
- ✅ Comenzi interactive cu butoane
- ✅ Sistem de reminder-uri
- ✅ Comenzi de moderare avansate

---

**Bot Discord complet cu toate functionalitatile moderne, incluzand dashboard web, economie, jocuri si moderare avansata!** 🚀


