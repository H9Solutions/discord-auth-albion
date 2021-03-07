import  { Client, Message  } from "discord.js";
const client = new Client();
import fetch from "node-fetch";
import { commandList, guildIdList, guildId } from "./allianceGuilds";
import db from "./database/connection"
import handleDeleteMembers, {MembersDataBase} from "./handleSignedMembers"
import color from "./console"
import {
  apiBaseUrl,
  discordGuildID,
  discordKey,
  prefix,
} from "../configuracao";


client.on("ready", async () => {
  console.log(`Logged in as ${client?.user?.tag}!`);

 // await handleDeleteMembers()

  setTimeout(async () => {
    await handleDeleteMembers()
  }, 3600000);
  
})

const removeRegister = async(id: number, discordId: string) => {
  
  await db("members")
    .where("discordId", "=", discordId)
    .where("id", "=", id)
    .del()
}
const newRegister = async (nome: string, discordId: string, guildName: string, guildId: string): Promise<boolean> => {
  try {
    if (await isRegistered(nome)) return false
    const response = await db("members")
      .insert({
        nome: nome,
        discordId: discordId,
        guildName: guildName,
        guildId: guildId
      })
    
    return true
  }
  catch(e) { return false }

}
const isRegistered = async (nome: string): Promise<boolean> => {
  try {
    const response = await db("members")
      .where("nome", "=", nome)
      .select("*")
    return response[0] !== undefined 
  }
  catch(e) {
    console.log(e)
    return false
  }
 
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

client.on("message", async (discord) => {

  try {

    if (!isPrefixSet(discord)) {

      return false
    }

    let msg = discord.content;
    let splited = msg.split(" ");
    let command = splited[0].substr(1, splited[0].length);
    let pessoa = splited[1];

    if (pessoa == "" || pessoa == undefined) {
      discord.channel.send(
        "Insira o nome da guild. Guilds disponiveis " + guildIdList.join(", ")
      )
      return;
    }

    if (await isRegistered(pessoa?.toUpperCase())) {
      discord.channel.send("Tô sentindo o cheiro de spy safado...");
      return false;
    }

    let {guildToken, guildPrefix, guildRoleId} = loadGuildInfo(guildId, splited)

    if (!guildToken || guildToken == "") {
      discord.channel.send(
        "Insira o nome da guild. Guilds disponiveis " + guildIdList.join(", ")
      )
      return
    }

    switch (command) {
      case "register":
        try {
          discord.channel.send("Aguarde, estamos verificando. Poderá levar alguns minutos...")
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

              console.log(color.yellowN, `Membro ${pessoa} sendo registrado. discordId:  ${authorId}`);

              discord?.member?.setNickname(guildPrefix + " " + pessoa);

              //RECEBE PERMISSAO DA GUILD REFERENTE
              const guildRoleIdResponse = await member?.roles.add(guildRoleId);
              //RECEBE PERMISSAO DA ALIANCA
              const allianceRoleIdResponse = await member?.roles.add("814324222058954753");


              await newRegister(
                pessoa.toUpperCase(), 
                authorId,
                guildPrefix,
                guildToken
              )

              console.log(color.cyanN, `Membro ${pessoa} registrado. discordId:  ${authorId}`);
              discord.channel.send("Seja bem vindo " + pessoa + ".")

            } catch (e) {
              
              discord.channel.send("Não foi possível adicionar o membro " + pessoa)
      
            }
       
          } else discord.channel.send("N encontrei ngm")
        } catch (e) {
          console.log("RESPONSE ERROR, TRATAR DEPOIS");
          console.log(e);
        }

        break;
      case "listRoles":
        console.log(discord?.guild?.roles);
        break;
      case "listkick":

        break
      case "clean":
        /**
         * 
         * N'AO SEI OQ TO FAZENDO
         */
      
        const authorId = discord.author.id;
        const member = discord?.guild?.member(authorId);
   
        
        const registrados = await db("members").where("status" , "=" , 0)
        
        registrados.forEach((membro: MembersDataBase) => {

          const discordId = membro.discordId
          console.log(discordId)
          const membroAtual = discord?.guild?.member(discordId);
          
          
          console.log("Removendo permissao de...")
          console.log(membroAtual?.nickname)

       
          membroAtual?.roles.remove("814324222058954753")
          
          guildId.forEach((c) => {
            membroAtual?.roles.remove(c.roleId)
          })
          
          removeRegister(membro.id, membro.discordId)
        })


        break
      default:
        discord.channel.send("Comandos disponíveis: " + commandList.join(", "))
    }

  } catch (e) {
    console.log("ERROR");
    console.log(e);
  }
  finally {
  }
})

client.login(discordKey);
