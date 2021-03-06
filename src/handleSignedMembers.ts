
import { guildId } from "./allianceGuilds";
import db from "./database/connection"
import fetch from "node-fetch";
import { Client, Message, Guild } from "discord.js";
const client = new Client();
import {discordGuildID} from "../configuracao"
import color from "./console"

interface ResponseAlbion {
  Name: string
  Id: string
  GuildName: string
  GuildId: string
}
export interface MembersDataBase {
  id: number 
  created_at: string 
  nome: string 
  discordId: string 
  guildName: string 
  guildId: string
}
const updateDatabase = async (registrado: MembersDataBase) => {
  const updated = await db("members")
    .update({status: 0})
    .where("nome" , "=" , registrado.nome.toUpperCase())
    .where("id" , "=" , registrado.id)

}
const handleDeleteMembers = async () => {

  for (const i in guildId) {
    const registrados = await db("members")
      .where("guildName" , "=", guildId[i].prefixo)

    console.log(color.yellowN, `Requisitando a guild ${guildId[i].prefixo}`)
    
    const response = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/guilds/${guildId[i].token}/members`)
    const data = await response.json()
    
    console.log(color.cyanN, `${guildId[i].prefixo} completa`)
    
    registrados.forEach((registrado: MembersDataBase) => {

      let isMemberStillAlliance = false

      data.forEach((membro: ResponseAlbion) => {
        if (registrado.nome == membro.Name.toUpperCase()) {
          isMemberStillAlliance = true
        }  
      })

      if (!isMemberStillAlliance) {
        updateDatabase(registrado)
      }

    })
  }  
 

}

export default handleDeleteMembers