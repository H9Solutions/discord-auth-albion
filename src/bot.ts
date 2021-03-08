import  { Client, Message } from "discord.js";
import handleDeleteMembers, { MembersDataBase } from "./handleSignedMembers"
import { guildIdList, guildId } from "./allianceGuilds";
import { apiBaseUrl, discordKey, prefix } from "../configuracao";
import db from "./database/connection"
import fetch from "node-fetch";
import color from "./console"
import EmbedMessage from "./controllers/EmbedMessage"
import Register from "./controllers/Register"



function init() {

  const client = new Client();

  client.on("ready", async () => {
    console.log(color.purple, `${horarioAtual()} Logged in as ${client?.user?.tag}!`)
  
    await handleDeleteMembers()
    setInterval(async () => {
      await handleDeleteMembers()
    }, 3600000)
  })
  
  const fix = (p: number) : string => {
    return p >= 10 ? p.toString() : `0${p}`
  } 
  const horarioAtual = (): string => {
    let data = new Date()
    return "[" +
      + fix(data.getDate())
      + "/" 
      + fix(data.getMonth() + 1)
      + " " 
      + fix(data.getHours())
      + ":"
      + fix(data.getMinutes())
      + ":"
      + fix(data.getSeconds())
      + "] "
  }
  const isPrefixSet = (discord: Message): boolean => {
    if (
      !(typeof discord.content === "string") ||
      !discord.content ||
      !discord.content?.startsWith(prefix)
    ) { return false } 
    else if (discord.content.length == 1) {
   
      return false
    }
    return true
  }
  const loadGuildInfo = (guildId: any, splited: string[]): any => {
    let __return = {
      guildToken: "",
      guildPrefix: "",
      guildRoleId: "",
    }
     guildId.map((c:any) => {
      if (
             c.name?.toUpperCase() == splited[2]?.toUpperCase() ||
        c?.apelido1?.toUpperCase() == splited[2]?.toUpperCase() ||
        c?.apelido2?.toUpperCase() == splited[2]?.toUpperCase() ||
        c?.apelido3?.toUpperCase() == splited[2]?.toUpperCase()
      ) {
        __return = {
          guildToken: c.token,
          guildPrefix: c.prefixo,
          guildRoleId: c.roleId,
        }
  
      }
    })
    return __return
  }
  
  const WARNING = 0xff0000
  const SUCCESS = 0x22bb33
  
  
  
  client.on("guildMemberRemove", async (member) => {
    console.log(color.blue, horarioAtual() + " O membro " + member.user?.username + "#" + member.user?.discriminator + " saiu do discord")
   
    const discordId = member.user?.id || ""
    
    const response = await Register.remove(discordId)
  
  
  })
  client.on("message", async (discord) => {
  
    try {
  
      if (!isPrefixSet(discord)) {
  
        return false
      }
  
      let msg = discord.content;
      let splited = msg.split(" ");
      let command = splited[0]?.substr(1, splited[0].length).toUpperCase();
      let pessoa = splited[1];
  
      if (pessoa == "" || pessoa == undefined || pessoa == null) {
  
        discord.channel.send(EmbedMessage({
          title: "Erro",
          color: WARNING,
          description: 'Insira corretamente o nome da guild. Disponíveis: \n**' 
            + guildIdList.join("**, **") + "**\n\n" 
            + `**Exemplo:**  !register TheWuiu wada`
        }))
  
        return false
      }
  
      if (await Register.isCreated(pessoa?.toUpperCase())) {
        
        discord.channel.send(EmbedMessage({
          title: ":face_with_symbols_over_mouth::face_with_symbols_over_mouth: Spy safado! :face_with_symbols_over_mouth::face_with_symbols_over_mouth:",
          color: WARNING,
          description: `:police_officer::hand_splayed: Parado aí, agente do Moroni.\n` 
            + `Por favor, a wadawell recruta? :scream:\n` 
            + `:police_officer::cucumber: Vou pranta a porra em você`
        }))
  
        return false;
      }
  
      let {guildToken, guildPrefix, guildRoleId} = loadGuildInfo(guildId, splited)
  
      if (!guildToken || guildToken == "" || guildToken == undefined || guildToken == null)  {
  
        discord.channel.send(EmbedMessage({
          title: "Erro",
          color: WARNING,
          description: 'Insira corretamente o nome da guild.' 
            + ' Disponíveis: \n**' + guildIdList.join("**, **") + "**\n\n" 
            + `**Exemplo:**  !register TheWuiu wada`
        }))
        return false 
      }
  
      switch (command) {
        case "REGISTER":
          try {
            discord.channel.send("Aguarde #"+pessoa+", estamos verificando. Poderá levar alguns minutos...")
            const response = await fetch(
              apiBaseUrl + `/guilds/${guildToken}/members`
            );
            const data: any = await response.json();
  
            let isMemberSigned = false;
            data.map((membro: any, key: number) => {
              if (isMemberSigned) return false;
              if (membro["Name"].toUpperCase() === pessoa.toUpperCase()) {
                isMemberSigned = true;
              }
            });
  
            if (isMemberSigned) {
              try {
                const authorId = discord.author.id;
                const member = discord?.guild?.member(authorId);
  
                console.log(color.yellow, `${horarioAtual()} Membro ${pessoa} tentando ser registrado. discordId:  ${authorId}`);
  
                let isSetNameOk = true
                let isSetRole = true
  
                await discord?.member?.setNickname(guildPrefix + " " + pessoa).catch((e)=> {
                  isSetNameOk = false
  
                  console.log(color.BgRed, horarioAtual() +"Permissão insuficiente para cadastrar #" + pessoa );
   
                  discord.channel.send(EmbedMessage({
                    title: "Permissão insuficiente.",
                    color: WARNING,
                  }))
                  
                  return false
                });
  
                if (!isSetNameOk) return false 
                //RECEBE PERMISSAO DA GUILD REFERENTE
                await member?.roles.add(guildRoleId).catch((e)=> {
                  isSetRole = false
  
                  console.log(color.BgCyan, e)
                  console.log(color.BgRed, "API Discord não respondeu #" + pessoa +"." );
    
                  return false
                })
                //RECEBE PERMISSAO DA ALIANCA
                await member?.roles.add("814324222058954753").catch((e)=> {
                  isSetRole = false
                  console.log(color.BgCyan, e)
                  console.log(color.BgRed, "API Discord não respondeu #" + pessoa +"." );
           
                  return false
                })
                if (!isSetRole) return false 
  
                await Register.create(
                  pessoa.toUpperCase(), 
                  authorId,
                  guildPrefix,
                  guildToken
                )
  
                console.log(color.cyan, `${horarioAtual()} Membro ${pessoa} registrado. discordId:  ${authorId}`);
  
           
                discord.channel.send(EmbedMessage({
                  title: "Seja bem vindo " + pessoa + ".",
                  color: SUCCESS,
                }))
  
  
              } catch (e) {
                discord.channel.send(EmbedMessage({
                  title: "Não foi possível adicionar o membro " + pessoa,
                  color: WARNING,
                }))
        
              }
         
            } else {
  
              discord.channel.send(EmbedMessage({
                title: 'Olá #' + pessoa + '. Registro não encontrado',
                color: WARNING,
                description: 'Nickname invalido ou nome de guild invalido. Verifique se o formato está correto. Guilds disponíveis: \n**' + guildIdList.join("**, **") + "**\n\n" 
                + `**Exemplo:**  !register TheWuiu wada`
              }))
            }
          } catch (e) {
            console.log(horarioAtual() +"RESPONSE ERROR, TRATAR DEPOIS");
            
            discord.channel.send(EmbedMessage({
              title: 'Olá #' + pessoa + '. Registro não encontrado',
              color: WARNING,
              description: 'Nickname invalido ou nome de guild invalido. Verifique se o formato está correto. Guilds disponíveis: \n**' + guildIdList.join("**, **") + "**\n\n" 
              + `**Exemplo:**  !register TheWuiu wada`
            }))
          
          }
  
          break;
        case "LISTROLES":
          console.log(discord?.guild?.roles);
          break;
        case "LISTKICK":
  
          break
        case "CLEAN":
        
          const registrados = await db("members").where("status" , "=" , 0)
          
          registrados.forEach((membro: MembersDataBase) => {
  
            const discordId = membro.discordId
            const membroAtual = discord?.guild?.member(discordId);
            
            
            console.log(color.Underscore + "Removendo permissao de "+ membroAtual?.nickname)
            membroAtual?.roles.remove("814324222058954753")
      
            guildId.forEach((c) => {
              membroAtual?.roles.remove(c.roleId)
            })
            
            Register.remove(membro.discordId)
          })
  
  
          break
        default:
          discord.channel.send("Comandos disponíveis: !register")
      }
  
    } catch (e) {
      console.log("ERROR");
      console.log(e);
    }
    finally {
    }
  })
  
  client.login(discordKey);
  
}
export default init