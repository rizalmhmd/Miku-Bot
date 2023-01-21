const fs = require('fs')
const chalk = require('chalk')

// User premium
global.prems = ["6288221417330","6288216335309","62882008912405","6282158224415","6288289748137","6282128660045","628990952883","6281325191564","6283857357711"]
global.mods = []

global.APIs = { // API Prefix
  // name: 'https://website'
  nrtm: 'https://nurutomo.herokuapp.com',
  bg: 'http://bochil.ddns.net',
  xteam: 'https://api.xteam.xyz',
  zahir: 'https://zahirr-web.herokuapp.com',
  zeks: 'https://api.zeks.me',
  pencarikode: 'https://pencarikode.xyz',
  LeysCoder: 'https://leyscoders-api.herokuapp.com',
  neoxr: 'https://neoxr-api.herokuapp.com',
  amel: 'https://melcanz.com',
  hardianto: 'https://hardianto.xyz',
  lol: 'https://api.lolhuman.xyz',
  adicug: 'https://api.adiofficial.xyz',
  males: 'https://malest.herokuapp.com'
}
global.APIKeys = { // APIKey Here
  // 'https://website': 'apikey'
  'https://neoxr-api.herokuapp.com': 'apikeylu',
  'https://api.xteam.xyz': 'apikeylu',
  'https://melcanz.com': 'apikeylu',
  'https://api.lolhuman.xyz': 'apikeylu',
  'https://zahirr-web.herokuapp.com': 'apikeylu',
  'https://api.zeks.me': 'apikeylu',
  'https://pencarikode.xyz': 'apikeylu',
  'https://hardianto.xyz': 'hardianto',
  'https://leyscoders-api.herokuapp.com': 'apikeylu',
  'https://api.adiofficial.xyz': 'apikeylu'
}

/*=========== HIASAN ===========*/
// DEFAULT MENU
global.dmenut = '❏═┅═━–〈' //top
global.dmenub = '┊•' //body
global.dmenub2 = '┊' //body for info cmd on Default menu
global.dmenuf = '┗––––––––––✦' //footer

// COMMAND MENU
global.cmenut = '❏––––––『' //top
global.cmenuh = '』––––––' //header
global.cmenub = '┊☃︎ ' //body
global.cmenuf = '┗━═┅═━––––––๑\n' //footer
global.cmenua = '\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     ' //after
global.pmenus = '☃︎' //pembatas menu selector

global.htki = '–––––『' //hiasan title kiri
global.htka = '』–––––' //hiasan title kanan
global.lopr = 'Ⓟ'
global.lolm = 'Ⓛ'
global.htjava = '☘︎' //hiasan Doang :v

/*=========== PENTING ===========*/
// Lainnya
global.Qoted = "m"
global.replyType = "simple"
global.autoquoted = false
global.setmenu = "simple"
global.listmenu = "simple"
global.setfitur = "simple"

global.textreply = "Assalamualaikum%20bang"
global.namabot = 'Miku'
global.botname = 'MIKU BOT'
global.botName = "Miku-Bot" // Tampilan Reply
global.wm = '© Miku-Bot Created By A.Farel.E ࿐'
global.titlebot = '🌱 ┊ RPG WhatsApp Bot'
global.namafile = 'kosong' // kosong
global.owner = ['6288216335309','62882008912405']
global.nomorowner = '6288216335309'
global.gcbot = 'https://chat.whatsapp.com/IDnmu9AI3eW0yE0xiKUq16'
global.ytowner = 'https://s.id/chyoutubeku'
global.packname = 'A.Farel.E'
global.author = 'Miku-Bot'

global.conns = []

/*============== SOCIAL ==============*/
// Kalo ga punya ketik "-" atau biarin aja biar ada creditsnya :v
global.sig = 'https://instagram.com/ppiowy_'
global.sgc = 'https://chat.whatsapp.com/IDnmu9AI3eW0yE0xiKUq16'
global.sgh = 'https://github.com/FarelE'

/*=========== TYPE DOCUMENT ===========*/
global.dpptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
global.ddocx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
global.dxlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
global.dpdf = 'application/pdf'
global.drtf = 'text/rtf'

/*=========== FAKE SIZE ===========*/
global.fsizedoc = '99999999999999' // default 10TB
global.fpagedoc = '999'

global.flaming = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text='
global.fluming = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=fluffy-logo&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text='
global.flarun = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=runner-logo&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text='
global.flasmurf = 'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=smurfs-logo&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&text='

global.prefa = ['!','.']
global.mess = {
    success: 'Berhasil\n\nJangan lupa subscribe channel youtube owner/pemilik bot\nhttps://s.id/chyoutubeku',
    admin: 'Fitur khusus admin group!',
    botAdmin: 'Bot harus menjadi admin terlebih dahulu!',
    owner: 'Fitur khusus owner/pemilik bot',
    group: 'Fitur digunakan hanya untuk group!',
    private: 'Fitur digunakan hanya untuk private chat!',
    bot: 'Fitur khusus pengguna nomor bot',
    wait: 'Sedang diproses...\n\nJika bot tidak merespon dalam waktu 5 menit silahkan coba lagi',
    premi: 'Fitur ini hanya digunakan untuk user premium!',
    endLimit: 'Limit harian anda telah habis, mainkan game untuk mendapatkan limit gratis!',
    error: 'Maaf, terjadi kesalahan',
    errorApi: 'Maaf, terjadi kesalahan di server-nya!',
    terimakasih: 'Terimkasih atas ulasannya kami harap kamu dapat menikmati bot dengan baik dan bijak',
    nilaisudah: 'Kamu sudah pernah memberikan ratting sebelumnya',
    sudahkomentar: 'Komentar kamu sudah tersimpan',
    example1: 'Welcome @user Di Group @subject Jangan Lupa Baca Rules @desc\n\nNote :\n1. @user (Mention User Join)\n2. @subject (Group Name)\n3. @tanggal (Date Now)\n4. @desc (Get Description Group)',
    example2: 'Good Bye @user Di Group @subject Jangan Lupa Baca Rules @desc\n\nNote :\n1. @user (Mention User Join)\n2. @subject (Group Name)\n3. @tanggal (Date Now)\n4. @desc (Get Description Group)',
    spam: 'Jangan spam, beri jeda 5 detik dalam penggunaan bot'
}
global.limitawal = {
    premium: "Unlimited",
    free: 100
}

global.multiplier = 39 // The higher, The harder levelup

global.rpg = {
  emoticon(string) {
    string = string.toLowerCase()
    let emot = {
      level: '🧬',
      limit: '🌌',
      healt: '❤️',
      exp: '✉️',
      money: '💵',
      potion: '🥤',
      diamond: '💎',
      common: '📦',
      uncommon: '🎁',
      mythi: '🗳️',
      legendary: '🗃️',
      pet: '🎁',
      sampah: '🗑',
      armor: '🥋',
      fishingrod: '🎣',
      pickaxe: '⛏️',
      sword: '⚔️',
      kayu: '🪵',
      batu: '🪨',
      iron: '⛓️',
      string: '🕸️',
      kuda: '🐎',
      kucing: '🐈' ,
      anjing: '🐕',
      makananpet: '🍖',
      gold: '👑',
      emerald: '💚'
    }
    let results = Object.keys(emot).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(string))
    if (!results.length) return ''
    else return emot[results[0][0]]
  }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update'${__filename}'`))
	delete require.cache[file]
	require(file)
})
