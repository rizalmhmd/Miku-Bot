
/*

   * Monggoh di copas, tapi kasih kredit y bang :)
   * Thanks to : Senkuu, Fajar Ihsana, Zeera ID
   * Klo ada Bug / Error, chat wa aja bang wa.me/6281312960393
   * Yang pasti ada error nya, Karena masih tahap perkembangan..

*/

// BIG THANKS TO : RIZKYFDLH

require('./config')
const attr = {};
   
const path = require("path");
const log = (pino = require("pino"));
let qrcode = require('qrcode')
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunc')

const FileType = require('file-type')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif } = require('./lib/exif')
    
const { 
  default: makeWaSocket,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  useMultiFileAuthState,
  DisconnectReason,
  getContentType,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessage,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  proto
} = require("@adiwajshing/baileys")

const parseMention = async (text = '') => {
	return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })


const decodeJid = (jid) => {
  if (/:\d+@/gi.test(jid)) {
    const decode = jidDecode(jid) || {};
    return ((decode.user && decode.server && decode.user + "@" + decode.server) || jid).trim();
  } else return jid.trim();
}


if(global.conns instanceof Array) console.log()
else global.conns = []

const jadibot = async (m, miku) => {
  const { sendFile , sendMessage} = miku;
  const { reply, from, command, sender } = m;
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, `./session-jadibot/session-${sender.split("@")[0]}`), log({ level: "silent" }));
  try {
    const start = async() => {
      let { version, isLatest } = await fetchLatestBaileysVersion();
      const miku = await makeWaSocket({
        auth: state,
        browser: [`Jadibot`, "Chrome", "1.0.0"],
	    	logger: log({ level: "silent" }),
	    	version,
	    	
	    	// Biar Button Sama Listnya Keliatan
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(
                    message.buttonsMessage ||
                    // || message.templateMessage
                    message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }

                return message;
            },
	    	
      })
      
      miku.store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
      
      miku.store.bind(miku.ev);
      miku.ev.on("creds.update", saveCreds);
      miku.ev.on("connection.update", async up => {
        const { lastDisconnect, connection } = up;
        if(connection == "connecting") return await m.reply("_*Connecting to Jadibot..*_");
        if(connection){
          if (connection != "connecting") console.log("Connecting to jadibot..")
        }
        console.log(up)
        if(up.qr) await sendFile(
                m.chat, 
                await qrcode.toDataURL(up.qr, { scale: 8 }), 
                'qrcode.png', 
                'Scan QR ini untuk jadi bot sementara\n\n1. Klik titik tiga di pojok kanan atas\n2. Ketuk Whatsapp Web\n3. Scan QR ini \nQR Expired dalam 20 detik', 
                m
            )
        console.log(connection)
        if (connection == "open") {
          miku.id = decodeJid(miku.user.id)
          miku.time = Date.now()
        global.conns.push(miku)
	      await m.reply(`*Connected to Whatsapp - Bot*\n\n*User :*\n _*• id : ${decodeJid(miku.user.id)}*_`)
	      user = `${decodeJid(miku.user.id)}`
	      txt = `*Terdeteksi menumpang Jadibot*\n\n _• User : wa.me/${user.split("@")[0]}_`
	      sendMessage(`${global.nomorowner}@s.whatsapp.net`,{text: txt,  withTag : true})
        }
        if(connection == "close") {
          let reason = new Boom(lastDisconnect.error).output.statusCode;
          if (reason === DisconnectReason.restartRequired) {
            m.reply("_*Restart Required, Restarting...*_")
            start();
          } else if (reason === DisconnectReason.timedOut) {
            m.reply("_*Connection Timeout...*_")
			    	miku.logout()
          } else {
            miku.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
          }
        }
      })
      
  miku.ev.on("contacts.update", (m) => {
		for (let kontak of m) {
			let jid = decodeJid(kontak.id);
			if (miku.store && miku.store.contacts) miku.store.contacts[jid] = { jid, name: kontak.notify };
		}
	});

	miku.ev.on("group-participants.update", async (anu) => {
          require("./group")(miku, anu);
	});
	
    miku.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
        mek = chatUpdate.messages[0]
        if (!mek.message) return
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (!miku.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
        m = smsg(miku, mek, store)
        require("./miku")(miku, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })
	
	
//━━━━━━━━━━━━━━━[ BATAS ]━━━━━━━━━━━━━━━━━//

    miku.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    miku.getName = (jid, withoutContact  = false) => {
        id = miku.decodeJid(jid)
        withoutContact = miku.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = miku.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === miku.decodeJid(miku.user.id) ?
            miku.user :
            (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    miku.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await miku.getName(i + '@s.whatsapp.net'),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await miku.getName(i + '@s.whatsapp.net')}\nFN:${await miku.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:afarelerlandika@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://s.id/chyoutubeku\nitem3.X-ABLabel:Youtube\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	miku.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
    }
	
	miku.setStatus = (status) => {
        miku.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        })
        return status
    }

    miku.public = true

    miku.serializeM = (m) => smsg(miku, m, store)

//━━━━━━━━━━━━━━━[ BATAS ]━━━━━━━━━━━━━━━━━//

    /*miku.ev.on('group-participants.update', async (anu) => {
        console.log(anu)
        try {
            let metadata = await miku.groupMetadata(anu.id)
            let participants = anu.participants
            for (let num of participants) {
                // Get Profile Picture User
                try {
                    ppuser = await miku.profilePictureUrl(num, 'image')
                } catch {
                    ppuser = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
                }

                // Get Profile Picture Group
                try {
                    ppgroup = await miku.profilePictureUrl(anu.id, 'image')
                } catch {
                    ppgroup = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
                }

                if (anu.action == 'add') {
                    miku.sendMessage(anu.id, { image: { url: ppuser }, contextInfo: { mentionedJid: [num] }, caption: `Hai kak @${num.split("@")[0]}\nSelamat datang di group\n${metadata.subject}${metadata.desc ? '\n\n' + metadata.desc : ''}` })
                    
            await sleep(5000)
            let buttonswelcome = [
              {buttonId: `menu`, buttonText: {displayText: 'Menu'}, type: 1},
              {buttonId: `rules`, buttonText: {displayText: 'Syarat Dan Ketentuan'}, type: 1}
            ]

            let buttonMessagewelcome = {
                text: `Hai kak @${num.split("@")[0]}\n\nKlik tombol *Menu* dibawah ini untuk menampilkan menu bot\n\nUntuk menampilkan peraturan bot, silahkan klik tombol *Syarat Dan Ketentuan* dibawah ini`,
                footer: wm,
                buttons: buttonswelcome,
                headerType: 1,
                mentions: [num]
             }
            miku.sendMessage(anu.id, buttonMessagewelcome)
                    
                } else if (anu.action == 'remove') {
                    miku.sendMessage(anu.id, { image: { url: ppuser }, contextInfo: { mentionedJid: [num] }, caption: `@${num.split("@")[0]} Keluar dari group ${metadata.subject}` })
                    
            await sleep(5000)
            let buttonsleave = [
              {buttonId: `selamat tinggal`, buttonText: {displayText: 'Selamat Tinggal 👋'}, type: 1}
            ]

            let buttonMessageleave = {
                text: `Selamat tinggal kak @${num.split("@")[0]}`,
                footer: wm,
                buttons: buttonsleave,
                headerType: 1,
                mentions: [num]
             }
            miku.sendMessage(anu.id, buttonMessageleave)
                    
                }
            }
        } catch (err) {
            console.log(err)
        }
    })*/

    // Setting
    miku.public = true
   
    miku.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    
    miku.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = miku.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    miku.getName = (jid, withoutContact  = false) => {
        id = miku.decodeJid(jid)
        withoutContact = miku.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = miku.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === miku.decodeJid(miku.user.id) ?
            miku.user :
            (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    miku.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await miku.getName(i + '@s.whatsapp.net'),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await miku.getName(i + '@s.whatsapp.net')}\nFN:${await miku.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:afarelerlandika@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://s.id/chyoutubeku\nitem3.X-ABLabel:Youtube\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	miku.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
    }
	
	miku.setStatus = (status) => {
        miku.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        })
        return status
    }

    miku.serializeM = (m) => smsg(miku, m, store)

//━━━━━━━━━━━━━━━[ BATAS ]━━━━━━━━━━━━━━━━━//

     miku.parseMention = (text = '') => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }

 /**
   * sendMessage v2
   * @param {String} chatId
   * @param {import('@adiwajshing/baileys').AnyMessageContent} message
   * @param {import('@adiwajshing/baileys').MiscMessageGenerationOptions} options
   * @returns
   */
 miku.sendMessageV2 = async (chatId, message, options = {}) => {
    let generate = await generateWAMessage(chatId, message, options)
    let type2 = getContentType(generate.message)
    if ('contextInfo' in options) generate.message[type2].contextInfo = options?.contextInfo
    if ('contextInfo' in message) generate.message[type2].contextInfo = message?.contextInfo
    return await miku.relayMessage(chatId, generate.message, { messageId: generate.key.id })
}

    miku.sendBut = async(jid, content, footer, button1, row1, quoted) => {
	  const buttons = [
	  {buttonId: row1, buttonText: {displayText: button1}, type: 1}
	  ]
const buttonMessage = {
    text: content,
    footer: footer,
    buttons: buttons,
    headerType: 1,
    mentions: miku.parseMention(footer+content)
}
return await miku.sendMessage(jid, buttonMessage, {quoted})
  }
	 miku.send2But = async(jid, content, footer, button1, row1, button2, row2, quoted) => {
	  const buttons = [
	   { buttonId: row1, buttonText: { displayText: button1 }, type: 1 },
          { buttonId: row2, buttonText: { displayText: button2 }, type: 1 }
	  ]
const buttonMessage = {
    text: content,
    footer: footer,
    buttons: buttons,
    headerType: 1
}
return await miku.sendMessage(jid, buttonMessage, {quoted})
  }

    // Button Text ✓
    miku.sendButMessage = async (id, text1, desc1, but = [], options  ) => {
    let buttonMessage = {
    text: text1,
    footer: desc1,
    buttons: but,
    headerType: 1
    }
    return miku.sendMessage(id, buttonMessage,{quoted: options})
    }

    /**
     * Reply to a message
     * @param {String} jid
     * @param {String|Object} text
     * @param {Object} quoted
     * @param {Object} mentions [m.sender]
     */
    miku.reply = (jid, text = '', quoted, options) => {
        return Buffer.isBuffer(text) ? this.sendFile(jid, text, 'file', '', quoted, false, options) : miku.sendMessage(jid, { ...options, text }, { quoted, ...options })
    }
    miku.fakeReply = (jid, text = '', fakeJid = miku.user.jid, fakeText = '', fakeGroupJid, options) => {
        return miku.sendMessage(jid, { text: text, mentions: miku.parseMention(text) }, { quoted: { key: { fromMe: fakeJid == miku.user.jid, participant: fakeJid, ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}) }, message: { conversation: fakeText }, ...options } })
    }
    miku.react = (jid, text, key) => {
        return miku.sendMessage(jid, { react: { text: text, key: key } })
    }

//━━━━━━━━━━━━━━━[ BATAS ]━━━━━━━━━━━━━━━━━//

    miku.sendButton = async (jid, content, footerText, button1, id1, quoted, options) => {
        const buttons = [
        { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
        ]
        const buttonMessage = {
            text: content,
            footer: footerText,
            mentions: await parseMention(content + footerText),
            ephemeralExpiration: 86400,
            ...options,
            buttons: buttons,
            headerType: 1
        }
        miku.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: parseMention(content + footerText), forwardingScore: 999999, isForwarded: true }, ...options })
    }
    miku.send2Button = async (jid, content, footerText, button1, id1, button2, id2, quoted, options) => {
        const buttons = [
        { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
        { buttonId: id2, buttonText: { displayText: button2 }, type: 1 }
        ]
        const buttonMessage = {
            text: content,
            footer: footerText,
            mentions: await parseMention(content + footerText),
            ephemeralExpiration: 86400,
            ...options,
            buttons: buttons,
            headerType: 1
        }
        miku.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentionedJid: parseMention(content + footerText), forwardingScore: 999999, isForwarded: true }, ...options })
    }
    miku.send3Button = async (jid, content, footerText, button1, id1, button2, id2, button3, id3, quoted, options) => {
        const buttons = [
        { buttonId: id1, buttonText: { displayText: button1 }, type: 1 },
        { buttonId: id2, buttonText: { displayText: button2 }, type: 1 },
        { buttonId: id3, buttonText: { displayText: button3 }, type: 1 }
        ]
        const buttonMessage = {
            text: content,
            footer: footerText,
            mentions: await parseMention(content + footerText),
            ephemeralExpiration: 86400,
            ...options,
            buttons: buttons,
            headerType: 1
        }
        miku.sendMessage(jid, buttonMessage, { quoted, ephemeralExpiration: 86400, contextInfo: { mentions: parseMention(content + footerText), forwardingScore: 99999, isForwarded: true }, ...options })
    }

//━━━━━━━━━━━━━━━[ BATAS ]━━━━━━━━━━━━━━━━━//

    /**
    * Send Media/File with Automatic Type Specifier
    * @param {String} jid
    * @param {String|Buffer} path
    * @param {String} filename
    * @param {String} caption
    * @param {Object} quoted
    * @param {Boolean} ptt
    * @param {Object} options
    */
    miku.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await miku.getFile(path, true)
        let { res, data: file, filename: pathFile } = type
        if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
        }
        let opt = { filename }
        if (quoted) opt.quoted = quoted
        if (!type) if (options.asDocument) options.asDocument = true
        let mtype = '', mimetype = type.mime
        if (/webp/.test(type.mime)) mtype = 'sticker'
        else if (/image/.test(type.mime)) mtype = 'image'
        else if (/video/.test(type.mime)) mtype = 'video'
        else if (/audio/.test(type.mime)) (
            convert = await (ptt ? toPTT : toAudio)(file, type.ext),
            file = convert.data,
            pathFile = convert.filename,
            mtype = 'audio',
            mimetype = 'audio/ogg; codecs=opus'
        )
        else mtype = 'document'
        return await miku.sendMessage(jid, {
            ...options,
            caption,
            ptt,
            [mtype]: { url: pathFile },
            mimetype
        }, {
            ephemeralExpiration: global.ephemeral,
            ...opt,
            ...options
        })
    }

//━━━━━━━━━━━━━━━[ BATAS ]━━━━━━━━━━━━━━━━━//

// Biar foto di button lokasi keliatan
    miku.resize = async(buffer, ukur1, ukur2) => {
    return new Promise(async(resolve, reject) => {
        let Jimp = require('jimp')
        var baper = await Jimp.read(buffer);
        var ab = await baper.resize(ukur1, ukur2).getBufferAsync(Jimp.MIME_JPEG)
        resolve(ab)
    })
}

      /** Resize Image
      *
      * @param {Buffer} Buffer (Only Image)
      * @param {Numeric} Width
      * @param {Numeric} Height
      */
      miku.reSize = async (image, width, height) => {
       let jimp = require('jimp')
       var oyy = await jimp.read(image);
       var kiyomasa = await oyy.resize(width, height).getBufferAsync(jimp.MIME_JPEG)
       return kiyomasa
      }
      // Siapa yang cita-citanya pakai resize buat keliatan thumbnailnya
      
      /** Send Button 5 Location
       *
       * @param {*} jid
       * @param {*} text
       * @param {*} footer
       * @param {*} location
       * @param [*] button
       * @param {*} options
       */
      miku.send5ButLoc = async (jid , text = '' , footer = '', lok, but = [], options = {}) =>{
       let resize = await miku.reSize(lok, 300, 150)
       var template = generateWAMessageFromContent(jid, {
       "templateMessage": {
       "hydratedTemplate": {
       "locationMessage": {
       "degreesLatitude": 0,
       "degreesLongitude": 0,
       "jpegThumbnail": resize
       },
       "hydratedContentText": text,
       "hydratedFooterText": footer,
       "hydratedButtons": but
       }
       }
       }, options)
       miku.relayMessage(jid, template.message, { messageId: template.key.id })
      }
      
//━━━━━━━━━━━━━━━[ BUTTON LOKASI ]━━━━━━━━━━━━━━━━━//

    /**
     * send Button Loc
     * @param {String} jid 
     * @param {String} contentText
     * @param {String} footer
     * @param {Buffer|String} buffer
     * @param {String[]} buttons 
     * @param {Object} quoted 
     * @param {Object} options 
     */
    miku.sendButtonLoc = async (jid, buffer, content, footer, button1, row1, quoted, options = {}) => {
        let type = await miku.getFile(buffer)
        let { res, data: file } = type
        if (res && res.status !== 100 || file.length <= 100) {
        try { throw { json: JSON.parse(file.toString()) } }
        catch (e) { if (e.json) throw e.json }
        }
        let buttons = [
        { buttonId: row1, buttonText: { displayText: button1 }, type: 1 }
        ]
    
        let buttonMessage = {
            location: { jpegThumbnail: file },
            caption: content,
            footer: footer,
            mentions: await parseMention(content + footer),
            ...options,
            buttons: buttons,
            headerType: 6
        }
        return await  miku.sendMessage(jid, buttonMessage, {
            quoted,
            upload: miku.waUploadToServer,
            ephemeralExpiration: 86400,
            mentions: await parseMention(content + footer),
            ...options
        })
    }
    miku.send2ButtonLoc = async (jid, buffer, content, footer, button1, row1, button2, row2, quoted, options = {}) => {
        let type = await miku.getFile(buffer)
        let { res, data: file } = type
        if (res && res.status !== 50 || file.length <= 50) {
        try { throw { json: JSON.parse(file.toString()) } }
        catch (e) { if (e.json) throw e.json }
        }
        let buttons = [
        { buttonId: row1, buttonText: { displayText: button1 }, type: 1 },
        { buttonId: row2, buttonText: { displayText: button2 }, type: 1 }
        ]
        
        let buttonMessage = {
            location: { jpegThumbnail: file },
            caption: content,
            footer: footer,
            mentions: await parseMention(content + footer),
            ...options,
            buttons: buttons,
            headerType: 6
        }
        return await  miku.sendMessage(jid, buttonMessage, {
            quoted,
            upload: miku.waUploadToServer,
            ephemeralExpiration: 86400,
            mentions: await parseMention(content + footer),
            ...options
        })
    }
    miku.send3ButtonLoc = async (jid, buffer, content, footer, button1, row1, button2, row2, button3, row3, quoted, options = {}) => {
        let type = await miku.getFile(buffer)
        let { res, data: file } = type
        if (res && res.status !== 100 || file.length <= 65536) {
        try { throw { json: JSON.parse(file.toString()) } }
        catch (e) { if (e.json) throw e.json }
        }
        let buttons = [
        { buttonId: row1, buttonText: { displayText: button1 }, type: 1 },
        { buttonId: row2, buttonText: { displayText: button2 }, type: 1 },
        { buttonId: row3, buttonText: { displayText: button3 }, type: 1 }
        ]
        
        let buttonMessage = {
            location: { jpegThumbnail: file },
            caption: content,
            footer: footer,
            mentions: await parseMention(content + footer),
            ...options,
            buttons: buttons,
            headerType: 6
        }
        return await  miku.sendMessage(jid, buttonMessage, {
            quoted,
            upload: miku.waUploadToServer,
            ephemeralExpiration: 86400,
            mentions: await parseMention(content + footer),
            ...options
        })
    }
      
//━━━━━━━━━━━━━━━[ BATAS ]━━━━━━━━━━━━━━━━━//
      
    /** Send Button 5 Image
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
    miku.send5ButImg = async (jid , text = '' , footer = '', img, but = [], options = {}) =>{
        let message = await prepareWAMessageMedia({ image: img }, { upload: miku.waUploadToServer })
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
        imageMessage: message.imageMessage,
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            miku.relayMessage(jid, template.message, { messageId: template.key.id })
    }

    // Add Other
    /** Send Button 5 Img
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
    miku.send5Img = async (jid , text = '' , footer = '', img, but = [], options = {}) =>{
        let message = await prepareWAMessageMedia({ image: img }, { upload: miku.waUploadToServer })
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
        imageMessage: message.imageMessage,
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            miku.relayMessage(jid, template.message, { messageId: template.key.id })
    }
    
    /** Send Button 5 Video
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
    miku.send5Vid = async (jid , text = '' , footer = '', vid, but = [], options = {}) =>{
        let message = await prepareWAMessageMedia({ video: vid }, { upload: miku.waUploadToServer })
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
        videoMessage: message.videoMessage,
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            miku.relayMessage(jid, template.message, { messageId: template.key.id })
    }
    
    /** Send Button 5 Gif
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
    miku.send5Gif = async (jid , text = '' , footer = '', vid, but = [], options = {}) =>{
        let message = await prepareWAMessageMedia({ video: vid, gifPlayback: true, gifAttribution: "GIPHY" }, { upload: miku.waUploadToServer })
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
        videoMessage: message.videoMessage,
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            miku.relayMessage(jid, template.message, { messageId: template.key.id })
    }
    
    /** Send Button 5 Location
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
     
    miku.send5Loc = async (jid , text = '' , footer = '', img, but = [], options = {}) =>{
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
               "hydratedContentText": text,
               "locationMessage": {
               "jpegThumbnail": img },
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            miku.relayMessage(jid, template.message, { messageId: template.key.id })
    }
    
    /** Send Button 5 Location
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param [*] button
     * @param {*} options
     * @returns
     */
     
    miku.send5Text = async (jid , text = '' , footer = '', but = [], options = {}) =>{
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            miku.relayMessage(jid, template.message, { messageId: template.key.id })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} buttons 
     * @param {*} caption 
     * @param {*} footer 
     * @param {*} quoted 
     * @param {*} options 
     */
    miku.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text,
            footer,
            buttons,
            headerType: 2,
            ...options
        }
        miku.sendMessage(jid, buttonMessage, { quoted, ...options })
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    miku.sendText = (jid, text, quoted = '', options) => miku.sendMessage(jid, { text: text, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    miku.sendImage = async (jid, path, caption = '', quoted = '', options) => {
	let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await miku.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    miku.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await miku.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} mime 
     * @param {*} options 
     * @returns 
     */
    miku.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await miku.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    miku.sendTextWithMentions = async (jid, text, quoted, options = {}) => miku.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    miku.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await miku.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    miku.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await miku.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    miku.sendVideoAsSticker2 = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await miku.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }
	
    /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachExtension 
     * @returns 
     */
    miku.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
	let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    miku.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
	}
        
	return buffer
     } 
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} filename
     * @param {*} caption
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    miku.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
	 let types = await miku.getFile(path, true)
           let { mime, ext, res, data, filename } = types
           if (res && res.status !== 200 || file.length <= 65536) {
               try { throw { json: JSON.parse(file.toString()) } }
               catch (e) { if (e.json) throw e.json }
           }
       let type = '', mimetype = mime, pathFile = filename
       if (options.asDocument) type = 'document'
       if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./lib/exif')
        let media = { mimetype: mime, data }
        pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
        await fs.promises.unlink(filename)
        type = 'sticker'
        mimetype = 'image/webp'
        }
        else if (/image/.test(mime)) type = 'image'
        else if (/video/.test(mime)) type = 'video'
        else if (/audio/.test(mime)) type = 'audio'
        else type = 'document'
        await miku.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
        return fs.promises.unlink(pathFile)
        }

    /**
     * 
     * @param {*} jid 
     * @param {*} message 
     * @param {*} forceForward 
     * @param {*} options 
     * @returns 
     */
    miku.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
		if (options.readViewOnce) {
			message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
			vtype = Object.keys(message.message.viewOnceMessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewOnceMessage.message[vtype].viewOnce
			message.message = {
				...message.message.viewOnceMessage.message
			}
		}

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
		let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await miku.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
        return waMessage
    }

    miku.cMod = (jid, copy, text = '', sender = miku.user.id, options = {}) => {
        //let copy = message.toJSON()
		let mtype = Object.keys(copy.message)[0]
		let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
		let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
		else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
		copy.key.remoteJid = jid
		copy.key.fromMe = sender === miku.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }

    /**
     * 
     * @param {*} path 
     * @returns 
     */
    miku.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        }

    }

//━━━━━━━━━━━━━━━[ BATAS ]━━━━━━━━━━━━━━━━━//
	
    }
    start()
  } catch (e){
    console.log(e)
  }
}

module.exports = { jadibot, conns }
