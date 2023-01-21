const { WAmikuet, proto, getContentType, downloadContentFromMessage } = require('@adiwajshing/baileys')
const axios = require('axios').default
const { PassThrough } = require('stream')
const moment = require('moment-timezone')
const ffmpeg = require('fluent-ffmpeg')
const FormData = require('form-data')
const chalk = require('chalk')
const fs = require('fs')

const os = require('os')
const speed = require('performance-now')
const { performance } = require('perf_hooks')
const { sizeFormatter } = require('human-readable')

const { exec, spawn, execSync } = require("child_process")

const fetch = require('node-fetch')

const cheerio = require('cheerio')

/**
 *
 * @param { string } text
 * @param { string } color
 */
const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
}

/**
 * @param {WAmikuet} miku
 * @param {proto.IWebMessageInfo} m
 */
module.exports = async (miku, m) => {
    const { ownerNumber, ownerName, botName } = require('./pengaturan.json')

    const time = moment().tz('Asia/Jakarta').format('HH:mm:ss')
    if (m.key && m.key.remoteJid === 'status@broadcast') return
    if (!m.message) return

    const type = getContentType(m.message)
    const quotedType = getContentType(m.message?.extendedTextMessage?.contextInfo?.quotedMessage) || null
    if (type == 'ephemeralMessage') {
        m.message = m.message.ephemeralMessage.message
        m.message = m.message.ephemeralMessage.message.viewOnceMessage
    }
    if (type == 'viewOnceMessage') {
        m.message = m.message.viewOnceMessage.message
    }

    const botId = miku.user.id.includes(':') ? miku.user.id.split(':')[0] + '@s.whatsapp.net' : miku.user.id

    const from = m.key.remoteJid
    const body = (type === 'conversation' && m.message.conversation) ? m.message.conversation : (type == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (type == 'documentMessage') && m.message.documentMessage.caption ? m.message.documentMessage.caption : (type == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (type == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ? m.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : (type === 'listResponseMessage') && m.message[type].selectedButtonId ? m.message[type].selectedButtonId : ''
    const responseMessage = type == 'listResponseMessage' ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '' : type == 'buttonsResponseMessage' ? m.message?.buttonsResponseMessage?.selectedButtonId || '' : ''
    const isGroup = from.endsWith('@g.us')

    var sender = isGroup ? m.key.participant : m.key.remoteJid
    sender = sender.includes(':') ? sender.split(':')[0] + '@s.whatsapp.net' : sender
    const senderName = m.pushName
    const senderNumber = sender.split('@')[0]

    const groupMetadata = isGroup ? await miku.groupMetadata(from) : null
    const groupName = groupMetadata?.subject || ''
    const groupMembers = groupMetadata?.participants || []
    const groupAdmins = groupMembers.filter((v) => v.admin).map((v) => v.id)

    const isCmd = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\\\©^]/.test(body)
    const prefix = isCmd ? body[0] : ''
    const isGroupAdmins = groupAdmins.includes(sender)
    const isBotGroupAdmins = groupMetadata && groupAdmins.includes(botId)
    const isOwner = ownerNumber.includes(sender)

    let command = isCmd ? body.slice(1).trim().split(' ').shift().toLowerCase() : ''
    let responseId = m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || m.message?.buttonsResponseMessage?.selectedButtonId || null
    let args = body.trim().split(' ').slice(1)
    let full_args = body.replace(command, '').slice(1).trim()
    const q = args.join(" ")

    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.m || quoted).mimetype || ''

    let mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    const isImage = type == 'imageMessage'
    const isVideo = type == 'videoMessage'
    const isAudio = type == 'audioMessage'
    const isSticker = type == 'stickerMessage'
    const isContact = type == 'contactMessage'
    const isLocation = type == 'locationMessage'

    const isQuoted = type == 'extendedTextMessage'
    const isQuotedImage = isQuoted && quotedType == 'imageMessage'
    const isQuotedVideo = isQuoted && quotedType == 'videoMessage'
    const isQuotedAudio = isQuoted && quotedType == 'audioMessage'
    const isQuotedSticker = isQuoted && quotedType == 'stickerMessage'
    const isQuotedContact = isQuoted && quotedType == 'contactMessage'
    const isQuotedLocation = isQuoted && quotedType == 'locationMessage'

    var mediaType = type
    var stream
    if (isQuotedImage || isQuotedVideo || isQuotedAudio || isQuotedSticker) {
        mediaType = quotedType
        m.message[mediaType] = m.message.extendedTextMessage.contextInfo.quotedMessage[mediaType]
        stream = await downloadContentFromMessage(m.message[mediaType], mediaType.replace('Message', '')).catch(console.error)
    }

    if (!isGroup && !isCmd) console.log(color(`[ ${time} ]`, 'white'), color('[ PRIVATE ]', 'aqua'), color(body.slice(0, 50), 'white'), 'from', color(senderNumber, 'yellow'))
    if (isGroup && !isCmd) console.log(color(`[ ${time} ]`, 'white'), color('[  GROUP  ]', 'aqua'), color(body.slice(0, 50), 'white'), 'from', color(senderNumber, 'yellow'), 'in', color(groupName, 'yellow'))
    if (!isGroup && isCmd) console.log(color(`[ ${time} ]`, 'white'), color('[ COMMAND ]', 'aqua'), color(body, 'white'), 'from', color(senderNumber, 'yellow'))
    if (isGroup && isCmd) console.log(color(`[ ${time} ]`, 'white'), color('[ COMMAND ]', 'aqua'), color(body, 'white'), 'from', color(senderNumber, 'yellow'), 'in', color(groupName, 'yellow'))

    const reply = async (text) => {
        return miku.sendMessage(from, { text: text.trim() }, { quoted: m })
    }

async function downloadAndSaveMediaMessage (type_file, path_file) {
    if (type_file === 'image') {
        var stream = await downloadContentFromMessage(m.message.imageMessage || m.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
       await fs.writeFileSync(path_file, buffer)
        return fs.readFileSync(path_file)
    } else if (type_file === 'video') {
        var stream = await downloadContentFromMessage(m.message.videoMessage || m.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return fs.readFileSync(path_file)
    } else if (type_file === 'sticker') {
        var stream = await downloadContentFromMessage(m.message.stickerMessage || m.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return fs.readFileSync(path_file)
    } else if (type_file === 'audio') {
        var stream = await downloadContentFromMessage(m.message.audioMessage || m.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(path_file, buffer)
        return fs.readFileSync(path_file)
    }
}

const getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (e) {
		console.log(`Error : ${e}`)
	}
}

                if (body.startsWith('=>')) {
                    if (!isOwner) return reply(`Fitur ini hanya untuk owner/pemilik bot saja`)
                    function Return(sul) {
                        sat = JSON.stringify(sul, null, 2)
                        bang = util.format(sat)
                            if (sat == undefined) {
                                bang = util.format(sul)
                            }
                            return reply(bang)
                    }
                    try {
                        reply(util.format(eval(`(async () => { return ${body.slice(3)} })()`)))
                    } catch (e) {
                        reply(String(e))
                    }
                }

                if (body.startsWith('>')) {
                    if (!isOwner) return reply(`Fitur ini hanya untuk owner/pemilik bot saja`)
                    try {
                        let evaled = await eval(body.slice(2))
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                        await reply(evaled)
                    } catch (err) {
                        await reply(String(err))
                    }
                }

                if (body.startsWith('$')) {
                    if (!isOwner) return reply(`Fitur ini hanya untuk owner/pemilik bot saja`)
                    exec(body.slice(2), (err, stdout) => {
                        if(err) return reply(err)
                        if (stdout) return reply(stdout)
                    })
                }

//================================================================================\\
const timeWib = moment().tz('Asia/Jakarta').format('HH:mm:ss')
if (body && timeWib == '04:00:00') {
console.log(color(`[ BOT ]`), color('Bentar lagi jam 5 nih kak, Jangan lupa sholat subuh ya kak', 'deeppink'))
reply(`Bentar lagi jam 5 nih kak, Jangan lupa sholat subuh ya kak`)
}
if (body && timeWib == '05:00:00') {
console.log(color(`[ BOT ]`), color('Udah sholat Subuh belum kak', 'deeppink'))
reply(`Udah sholat Subuh belum kak`)
}
if (body && timeWib == '06:00:00') {
console.log(color(`[ BOT ]`), color('Pagi kak, Jangan lupa mandi', 'deeppink'))
reply(`Pagi kak, Jangan lupa mandi`)
}
if (body && timeWib == '11:00:00') {
console.log(color(`[ BOT ]`), color('Siang kak, Dah mandi blm kak?', 'deeppink'))
reply(`Siang kak, Dah mandi blm kak?`)
}
if (body && timeWib == '12:00:00') {
console.log(color(`[ BOT ]`), color('Dah jam 12 kak, Jangan lupa sholat Dzuhur ya kak', 'deeppink'))
reply(`Dah jam 12 kak, Jangan lupa sholat Dzuhur ya kak`)
}
if (body && timeWib == '15:00:00') {
console.log(color(`[ BOT ]`), color('Dah jam 3 kak, Jangan lupa sholat Ashar ya kak', 'deeppink'))
reply(`Dah jam 3 kak, Jangan lupa sholat Ashar ya kak`)
}
if (body && timeWib == '18:00:00') {
console.log(color(`[ BOT ]`), color('Udah mahgrip nih kak, jangan lupa sholat ya', 'deeppink'))
reply(`Udah mahgrip nih kak, jangan lupa sholat ya`)
}
if (body && timeWib == '19:00:00') {
console.log(color(`[ BOT ]`), color('Bentar lagi jam 8 kak, Yok kak main botnya buat nanti lagi', 'deeppink'))
reply(`Bentar lagi jam 8 kak, Yok kak main botnya buat nanti lagi`)
}
if (body && timeWib == '20:00:00') {
console.log(color(`[ BOT ]`), color('Selamat malam kak, Jangan begadang ya kak, Tar sakit loh', 'deeppink'))
reply(`Selamat malam kak, Jangan begadang ya kak, Tar sakit loh`)
}
if (body && timeWib == '00:00:00') {
console.log(color(`[ BOT ]`), color('ngantuk kak, tidur dulu ya kak', 'deeppink'))
reply(`ngantuk kak, tidur dulu ya kak`)
}
//================================================================================\\

    switch (command) {
/*
    case 'menu':
    const sections = [
    {
	title: "MENU STICKER",
	rows: [
	    {title: "Buat sticker foto atau video", rowId: `${prefix}sticker`, description: ""},
	    {title: "Ubah sticker menjadi gambar", rowId: `${prefix}toimg`, description: ""}
	]
    },
   {
	title: "MENU ANIME",
	rows: [
	    {title: "Info anime terbaru musim ini", rowId: `${prefix}otakudesu`, description: "Source: otakudesu website"},
	    {title: "Belum ada", rowId: "option4", description: "Malaz"}
	]
    },
]

const listMessage = {
  text: "Silahkan klik menu, di bawah ini",
  buttonText: "Menu",
  sections
}
miku.sendMessage(from, listMessage)
break
case 'otakudesu': {
let res = await fetch(`https://otakudesu-anime-api.vercel.app/api/v1/ongoing/1/`)
let anu = await res.json()
let list_rows = []
for(let a of anu.ongoing) {
list_rows.push({
title: a.title, rowId: `${prefix}otakudesu-detail ${a.title}`, description: `${a.total_episode.replace(' Episode', 'Episode')}`})}
const sections = [
    {
	title: "Anime update musim ini",
	rows: list_rows
	 },]
   const listMessage = {
  text: `Silahkan pilih melalui list di bawah`,
  buttonText: "List",
  sections
}
miku.sendMessage(from, listMessage,{ quoted: m })
}
break
case 'otakudesu-detail': {
let res = await fetch(`https://otakudesu-anime-api.vercel.app/api/v1/search/${q}/`)
let anu = await res.json()
for(let a of anu.search) {
let teksnya = `*Judul:* ${a.title}
*Genre:* ${a.genres}
*Status:* ${a.status}
*Skor:* ${a.rating}`
miku.sendMessage(from, { image: { url: a.thumb }, caption: teksnya }, { quoted: m })
}
}
break
        case 'owner':
            const vcard =
                'BEGIN:VCARD\n' + // metadata of the contact card
                'VERSION:3.0\n' +
                `FN:${ownerName}\n` + // full name
                `ORG:${botName};\n` + // the organization of the contact
                `TEL;type=m;type=CELL;type=VOICE;waid=${ownerNumber[ownerNumber.length - 1].split('@')[0]}:+${ownerNumber[ownerNumber.length - 1].split('@')[0]}\n` + // WhatsApp ID + phone number
                'END:VCARD'

            miku.sendMessage(from, {
                contacts: {
                    displayName: ownerName,
                    contacts: [{ vcard }],
                },
            })
            break
			case 'ping': case 'botstatus': case 'statusbot': {
const formatp = sizeFormatter({
    std: 'JEDEC', //'SI' = default | 'IEC' | 'JEDEC'
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})
                const used = process.memoryUsage()
                const cpus = os.cpus().map(cpu => {
                    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
			        return cpu
                })
                const cpu = cpus.reduce((last, cpu, _, { length }) => {
                    last.total += cpu.total
                    last.speed += cpu.speed / length
                    last.times.user += cpu.times.user
                    last.times.nice += cpu.times.nice
                    last.times.sys += cpu.times.sys
                    last.times.idle += cpu.times.idle
                    last.times.irq += cpu.times.irq
                    return last
                }, {
                    speed: 0,
                    total: 0,
                    times: {
			            user: 0,
			            nice: 0,
			            sys: 0,
			            idle: 0,
			            irq: 0
                }
                })
                let timestamp = speed()
                let latensi = speed() - timestamp
                neww = performance.now()
                oldd = performance.now()
                respon = `
Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${oldd - neww} _miliseconds_

💻 Info Computer
RAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}

_NodeJS Memory Usaage_
${Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v=>v.length)),' ')}: ${formatp(used[key])}`).join('\n')}

${cpus[0] ? `_Total CPU Usage_
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}
_CPU Core(s) Usage (${cpus.length} Core CPU)_
${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}
                `.trim()
                reply(respon)
            }
            break
			case "toimg":
if (!isQuotedSticker) return reply(`Kirim sticker dengan caption ${prefix + command} atau tag sticker yang sudah dikirim`)
let rand = await Math.floor(Math.random()*7613786)
var rand1 = rand+'.webp' 
let buffer = await downloadAndSaveMediaMessage("sticker", "./"+rand1)

var rand2 = rand+'.png'			   
			    fs.writeFileSync(`./${rand1}`, buffer)
			    if (isQuotedSticker && m.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage.isAnimated !== true) {
			    exec(`ffmpeg -i ./${rand1} ./${rand2}`, (err) => {
			      fs.unlinkSync(`./${rand1}`)
			      if (err) return reply(err)
			      miku.sendMessage(from, { image: fs.readFileSync(`${rand2}`) }, { quoted: m })
			    
				  fs.unlinkSync(`${rand2}`)
			    })
			    } else {
			    }
break
        case 'sticker':
        case 's':
            if (!(isImage || isQuotedImage || isVideo || isQuotedVideo)) return reply(`Kirim media dengan caption ${prefix + command} atau tag media yang sudah dikirim`)
            var stream = await downloadContentFromMessage(m.message[mediaType], mediaType.replace('Message', ''))
            let stickerStream = new PassThrough()
            if (isImage || isQuotedImage) {
                ffmpeg(stream)
                    .on('start', function (cmd) {
                        console.log(`Started : ${cmd}`)
                    })
                    .on('error', function (err) {
                        console.log(`Error : ${err}`)
                    })
                    .on('end', function () {
                        console.log('Finish')
                    })
                    .addOutputOptions([
                        `-vcodec`,
                        `libwebp`,
                        `-vf`,
                        `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
                    ])
                    .toFormat('webp')
                    .writeToStream(stickerStream)
                miku.sendMessage(from, { sticker: { stream: stickerStream } })
            } else if (isVideo || isQuotedVideo) {
                ffmpeg(stream)
                    .on('start', function (cmd) {
                        console.log(`Started : ${cmd}`)
                    })
                    .on('error', function (err) {
                        console.log(`Error : ${err}`)
                    })
                    .on('end', async () => {
                        miku.sendMessage(from, { sticker: { url: `./temp/stickers/${sender}.webp` } }).then(() => {
                            fs.unlinkSync(`./temp/stickers/${sender}.webp`)
                            console.log('Finish')
                        })
                    })
                    .addOutputOptions([
                        `-vcodec`,
                        `libwebp`,
                        `-vf`,
                        `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
                    ])
                    .toFormat('webp')
                    .save(`./temp/stickers/${sender}.webp`)
            }
            break
*/
        default:
        /*
            if (isCmd) {
                reply(`Maaf, command *${prefix}${command}* tidak ada di menu bot`)
            }
            */
    }
}
