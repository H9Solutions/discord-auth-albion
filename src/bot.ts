import  { Client, Message, MessageEmbed  } from "discord.js";
import handleDeleteMembers, { MembersDataBase } from "./handleSignedMembers"
import { commandList, guildIdList, guildId } from "./allianceGuilds";
import { apiBaseUrl, discordKey, prefix } from "../configuracao";
import db from "./database/connection"
import fetch from "node-fetch";
import color from "./console"

const client = new Client();
let embed
client.on("ready", async () => {
  console.log(`Logged in as ${client?.user?.tag}!`);

  //await handleDeleteMembers()

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
client.on("guildMemberRemove", (member) => {
  console.log("Esse membro saiu")
  console.log(member)
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

    if (pessoa == "" || pessoa == undefined) {
      embed = new MessageEmbed()
      .setTitle('Erro')
      .setColor(0xff0000)
      .setDescription('Insira corretamente o nome da guild. Disponíveis: \n**' + guildIdList.join("**, **") + "**\n\n" 
      + `**Exemplo:**  !register TheWuiu wada`
      );

      discord.channel.send(embed)
      return;
    }

    if (await isRegistered(pessoa?.toUpperCase())) {
      
      embed = new MessageEmbed()
      // Set the title of the field
      .setTitle(":face_with_symbols_over_mouth::face_with_symbols_over_mouth: Spy safado! :face_with_symbols_over_mouth::face_with_symbols_over_mouth:")
      .setColor(0xff0000)
      .setDescription(
        `:police_officer::hand_splayed: Parado aí, agente do Moroni.\n` +
        `Por favor, a wadawell recruta? :scream:\n` +
        `:police_officer::cucumber: Vou pranta a porra em você`
      
      );

      discord.channel.send(embed)

      return false;
    }

    let {guildToken, guildPrefix, guildRoleId} = loadGuildInfo(guildId, splited)

    if (!guildToken || guildToken == "" || guildToken == undefined || guildToken == null)  {

      embed = new MessageEmbed()
        .setTitle('Erro')
        .setColor(0xff0000)
        .setDescription('Insira corretamente o nome da guild. Disponíveis: \n**' + guildIdList.join("**, **") + "**\n\n" 
        + `**Exemplo:**  !register TheWuiu wada`
      );

      discord.channel.send(embed)
      return
    }

    switch (command) {
      case "REGISTER":
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

              let isSetNameOk = true

              await discord?.member?.setNickname(guildPrefix + " " + pessoa).catch((e)=> {
                isSetNameOk = false

                console.log(color.BgRed, "Permissão insuficiente para cadastrar @" + pessoa );
                embed = new MessageEmbed()
                .setTitle('Permissão insuficiente. ')
                .setColor(0xff0000)
                discord.channel.send(embed)
                return false
              });

              if (!isSetNameOk) return false 
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

              embed = new MessageEmbed()
              .setTitle("Seja bem vindo " + pessoa + ".")
              .setColor(0x22bb33)
  

              discord.channel.send(embed)

            } catch (e) {
              
              discord.channel.send("Não foi possível adicionar o membro " + pessoa)
      
            }
       
          } else {
            embed = new MessageEmbed()
            .setTitle('Registro não encontrado')
            .setColor(0xff0000)
            .setDescription('Verifique se o formato está correto. Guilds disponíveis: \n**' + guildIdList.join("**, **") + "**\n\n" 
            + `**Exemplo:**  !register TheWuiu wada`
            
            );
    
            discord.channel.send(embed)
          }
        } catch (e) {
          console.log("RESPONSE ERROR, TRATAR DEPOIS");
          
          embed = new MessageEmbed()
          .setTitle('Erro inesperado.')
          .setColor(0xff0000)
          .setDescription('Verifique se o formato está correto. Guilds disponíveis: \n**' + guildIdList.join("**, **") + "**\n\n" 
          + `**Exemplo:**  !register TheWuiu wada`
          
          );


        }

        break;
      case "LISTROLES":
        console.log(discord?.guild?.roles);
        break;
      case "LISTKICK":

        break
      case "CLEAN":
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
