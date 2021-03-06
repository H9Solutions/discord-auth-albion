const guildId = [
  {
    prefixo: "[WADA]",
    name: "wada",
    apelido1: "wadawell",
    token: "WfDRZbdfQwSTXwDmmEQi3Q",
    roleId: "814362458512162817"
  },
  {
    prefixo: "[A TROPA]",
    name: "tropa",
    apelido1: "atropa",
    token: "5uc3Cx-aS0GYK40emBUgCw",
    roleId: "814927864158748722"
  },
  {
    prefixo: "[AG]",
    name: "agressao",
    apelido1: "ag",
    token: "34t5ryw0ShiNB9HmCixOBQ",
    roleId: "817074698256252968"
  },
  {
    prefixo: "[AZ]",
    name: "allcatraz",
    apelido1: "az",
    token: "BqdtcXKqQoKJ-JLCUgp1pQ",
    roleId: "814363088895344680"
  },
  {
    prefixo: "[BnB]",
    name: "bnb",
    apelido1: "blood",
    apelido2: "bloodnbones",
    token: "bho1mQLgRl6OyewIZqu0fg",
    roleId: "814363291010596915"
  },
  {
    prefixo: "[HZ]",
    name: "hangerz",
    apelido1: "hz",
    token: "q6NWJTLNQlO04UtWpd8jQg",
    roleId: "815010317338804225"
  },
  {
    prefixo: "[PND]",
    name: "pandora",
    apelido1: "pnd",
    token: "6WvULIq6RXq-NShLc8wDTA",
    roleId: "814362521565396992"
  },
  {
    prefixo: "[RDM]",
    name: "redmonster",
    apelido1: "rdm",
    token: "7inMCWiQRA2jzuM0zdDXIA",
    roleId: "816321954151530567"
  },

  {
    prefixo: "[W2]",
    name: "wada2",
    apelido1: "wadawell2",
    apelido2: "w2",
    apelido3: "wada22",
    token: "C3BZuH7KQ3KLnmE5w7wtPw",
    roleId: "817213613957316648"
  },
  
]

const commandList = [
  "register",
  "listRoles",
  "listkick",
  "clean"
]


const guildIdList = guildId.map(guild => guild.name)

export {
  commandList,
  guildId,
  guildIdList
}