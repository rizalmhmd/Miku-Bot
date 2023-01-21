const fs = require('fs')
let tebakgambar = JSON.parse(fs.readFileSync('./database/tebakgambar.json'))
let caklontong = JSON.parse(fs.readFileSync('./database/caklontong.json'))
let tebakkata = JSON.parse(fs.readFileSync('./database/tebakkata.json'))
let tebakbendera = JSON.parse(fs.readFileSync('./database/tebakbendera.json'))
let tebakkalimat = JSON.parse(fs.readFileSync('./database/tebakkalimat.json'))
let siapaaku = JSON.parse(fs.readFileSync('./database/siapaaku.json'))
let tebaklirik = JSON.parse(fs.readFileSync('./database/tebaklirik.json'))
let tebaktebakan = JSON.parse(fs.readFileSync('./database/tebaktebakan.json'))
let susunkata = JSON.parse(fs.readFileSync('./database/susunkata.json'))


//TEBAK GAMBAR
global.cekTebakgambar = (sender) => {
    let status = false
    Object.keys(tebakgambar).forEach((i) => {
        if (tebakgambar[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addTebakgambar = (sender, deskripsi, jawaban, image) => {
    const obj = { id: sender, soal: deskripsi, jawaban: jawaban, image: image }
    tebakgambar.push(obj)
    global.setDatabase('tebakgambar.json', JSON.stringify(tebakgambar))
}

global.delTebakgambar = (sender) => {
    let position = null
    Object.keys(tebakgambar).forEach((i) => {
        if (tebakgambar[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        tebakgambar.splice(position, 1)
        global.setDatabase('tebakgambar.json', JSON.stringify(tebakgambar))
    }
    return true
}

global.getSoalTebakgambar = (sender) => {
    let position = false
    Object.keys(tebakgambar).forEach((i) => {
        if (tebakgambar[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakgambar[position].soal
    }
}

global.getJawabanTebakgambar = (sender) => {
    let position = false
    Object.keys(tebakgambar).forEach((i) => {
        if (tebakgambar[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakgambar[position].jawaban
    }
}

global.getImageTebakgambar = (sender) => {
    let position = false
    Object.keys(tebakgambar).forEach((i) => {
        if (tebakgambar[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakgambar[position].image
    }
}


//CAK LONTONG
global.cekCaklontong = (sender) => {
    let status = false
    Object.keys(caklontong).forEach((i) => {
        if (caklontong[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addCaklontong = (sender, soal, jawaban, deskripsi) => {
    const obj = { id: sender, soal: soal, jawaban: jawaban, deskripsi: deskripsi }
    caklontong.push(obj)
    global.setDatabase('caklontong.json', JSON.stringify(caklontong))
}

global.delCaklontong = (sender) => {
    let position = null
    Object.keys(caklontong).forEach((i) => {
        if (caklontong[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        caklontong.splice(position, 1)
        global.setDatabase('caklontong.json', JSON.stringify(caklontong))
    }
    return true
}

global.getSoalCaklontong = (sender) => {
    let position = false
    Object.keys(caklontong).forEach((i) => {
        if (caklontong[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return caklontong[position].soal
    }
}

global.getJawabanCaklontong = (sender) => {
    let position = false
    Object.keys(caklontong).forEach((i) => {
        if (caklontong[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return caklontong[position].jawaban
    }
}

global.getDeskripsiCaklontong = (sender) => {
    let position = false
    Object.keys(caklontong).forEach((i) => {
        if (caklontong[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return caklontong[position].deskripsi
    }
}

//TEBAK KATA
global.cekTebakkata = (sender) => {
    let status = false
    Object.keys(tebakkata).forEach((i) => {
        if (tebakkata[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addTebakkata = (sender, soal, jawaban) => {
    const obj = { id: sender, soal: soal, jawaban: jawaban }
    tebakkata.push(obj)
    global.setDatabase('tebakkata.json', JSON.stringify(tebakkata))
}

global.delTebakkata = (sender) => {
    let position = null
    Object.keys(tebakkata).forEach((i) => {
        if (tebakkata[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        tebakkata.splice(position, 1)
        global.setDatabase('tebakkata.json', JSON.stringify(tebakkata))
    }
    return true
}

global.getSoalTebakkata = (sender) => {
    let position = false
    Object.keys(tebakkata).forEach((i) => {
        if (tebakkata[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakkata[position].soal
    }
}

global.getJawabanTebakkata = (sender) => {
    let position = false
    Object.keys(tebakkata).forEach((i) => {
        if (tebakkata[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakkata[position].jawaban
    }
}

//TEBAK BENDERA
global.cekTebakbendera = (sender) => {
    let status = false
    Object.keys(tebakbendera).forEach((i) => {
        if (tebakbendera[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addTebakbendera = (sender, image, jawaban) => {
    const obj = { id: sender, soal: image, jawaban: jawaban }
    tebakbendera.push(obj)
    global.setDatabase('tebakbendera.json', JSON.stringify(tebakbendera))
}

global.delTebakbendera = (sender) => {
    let position = null
    Object.keys(tebakbendera).forEach((i) => {
        if (tebakbendera[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        tebakbendera.splice(position, 1)
        global.setDatabase('tebakbendera.json', JSON.stringify(tebakbendera))
    }
    return true
}

global.getSoalTebakbendera = (sender) => {
    let position = false
    Object.keys(tebakbendera).forEach((i) => {
        if (tebakbendera[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakbendera[position].soal
    }
}

global.getJawabanTebakbendera = (sender) => {
    let position = false
    Object.keys(tebakbendera).forEach((i) => {
        if (tebakbendera[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakbendera[position].jawaban
    }
}

//TEBAK KALIMAT
global.cekTebakkalimat = (sender) => {
    let status = false
    Object.keys(tebakkalimat).forEach((i) => {
        if (tebakkalimat[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addTebakkalimat = (sender, soal, jawaban) => {
    const obj = { id: sender, soal: soal, jawaban: jawaban }
    tebakkalimat.push(obj)
    global.setDatabase('tebakkalimat.json', JSON.stringify(tebakkalimat))
}

global.delTebakkalimat = (sender) => {
    let position = null
    Object.keys(tebakkalimat).forEach((i) => {
        if (tebakkalimat[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        tebakkalimat.splice(position, 1)
        global.setDatabase('tebakkalimat.json', JSON.stringify(tebakkalimat))
    }
    return true
}

global.getSoalTebakkalimat = (sender) => {
    let position = false
    Object.keys(tebakkalimat).forEach((i) => {
        if (tebakkalimat[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakkalimat[position].soal
    }
}

global.getJawabanTebakkalimat = (sender) => {
    let position = false
    Object.keys(tebakkalimat).forEach((i) => {
        if (tebakkalimat[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebakkalimat[position].jawaban
    }
}


//SIAPA AKU
global.cekSiapaaku = (sender) => {
    let status = false
    Object.keys(siapaaku).forEach((i) => {
        if (siapaaku[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addSiapaaku = (sender, soal, jawaban) => {
    const obj = { id: sender, soal: soal, jawaban: jawaban }
    siapaaku.push(obj)
    global.setDatabase('siapaaku.json', JSON.stringify(siapaaku))
}

global.delSiapaaku = (sender) => {
    let position = null
    Object.keys(siapaaku).forEach((i) => {
        if (siapaaku[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        siapaaku.splice(position, 1)
        global.setDatabase('siapaaku.json', JSON.stringify(siapaaku))
    }
    return true
}

global.getSoalSiapaaku = (sender) => {
    let position = false
    Object.keys(siapaaku).forEach((i) => {
        if (siapaaku[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return siapaaku[position].soal
    }
}

global.getJawabanSiapaaku = (sender) => {
    let position = false
    Object.keys(siapaaku).forEach((i) => {
        if (siapaaku[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return siapaaku[position].jawaban
    }
}

//TEBAK LIRIK
global.cekTebaklirik = (sender) => {
    let status = false
    Object.keys(tebaklirik).forEach((i) => {
        if (tebaklirik[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addTebaklirik = (sender, soal, jawaban) => {
    const obj = { id: sender, soal: soal, jawaban: jawaban }
    tebaklirik.push(obj)
    global.setDatabase('tebaklirik.json', JSON.stringify(tebaklirik))
}

global.delTebaklirik = (sender) => {
    let position = null
    Object.keys(tebaklirik).forEach((i) => {
        if (tebaklirik[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        tebaklirik.splice(position, 1)
        global.setDatabase('tebaklirik.json', JSON.stringify(tebaklirik))
    }
    return true
}

global.getSoalTebaklirik = (sender) => {
    let position = false
    Object.keys(tebaklirik).forEach((i) => {
        if (tebaklirik[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebaklirik[position].soal
    }
}

global.getJawabanTebaklirik = (sender) => {
    let position = false
    Object.keys(tebaklirik).forEach((i) => {
        if (tebaklirik[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebaklirik[position].jawaban
    }
}

//TEBAK TEBAKAN
global.cekTebaktebakan = (sender) => {
    let status = false
    Object.keys(tebaktebakan).forEach((i) => {
        if (tebaktebakan[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addTebaktebakan = (sender, soal, jawaban) => {
    const obj = { id: sender, soal: soal, jawaban: jawaban }
    tebaktebakan.push(obj)
    global.setDatabase('tebaktebakan.json', JSON.stringify(tebaktebakan))
}

global.delTebaktebakan = (sender) => {
    let position = null
    Object.keys(tebaktebakan).forEach((i) => {
        if (tebaktebakan[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        tebaktebakan.splice(position, 1)
        global.setDatabase('tebaktebakan.json', JSON.stringify(tebaktebakan))
    }
    return true
}

global.getSoalTebaktebakan = (sender) => {
    let position = false
    Object.keys(tebaktebakan).forEach((i) => {
        if (tebaktebakan[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebaktebakan[position].soal
    }
}

global.getJawabanTebaktebakan = (sender) => {
    let position = false
    Object.keys(tebaktebakan).forEach((i) => {
        if (tebaktebakan[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return tebaktebakan[position].jawaban
    }
}

//SUSUN KATA
global.cekSusunkata = (sender) => {
    let status = false
    Object.keys(susunkata).forEach((i) => {
        if (susunkata[i].id == sender) {
            status = true
        }
    })
    return status
}

global.addSusunkata = (sender, soal, tipe, jawaban) => {
    const obj = { id: sender, soal: soal, type: tipe, jawaban: jawaban }
    susunkata.push(obj)
    global.setDatabase('susunkata.json', JSON.stringify(susunkata))
}

global.delSusunkata = (sender) => {
    let position = null
    Object.keys(susunkata).forEach((i) => {
        if (susunkata[i].id == sender) {
            position = i
        }
    })
    if (position !== null) {
        susunkata.splice(position, 1)
        global.setDatabase('susunkata.json', JSON.stringify(susunkata))
    }
    return true
}

global.getSoalSusunkata = (sender) => {
    let position = false
    Object.keys(susunkata).forEach((i) => {
        if (susunkata[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return susunkata[position].soal
    }
}

global.getTypeSusunkata = (sender) => {
    let position = false
    Object.keys(susunkata).forEach((i) => {
        if (susunkata[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return susunkata[position].type
    }
}

global.getJawabanSusunkata = (sender) => {
    let position = false
    Object.keys(susunkata).forEach((i) => {
        if (susunkata[i].id == sender) {
            position = i
        }
    })
    if (position !== false) {
        return susunkata[position].jawaban
    }
}


