import { guildId } from "./allianceGuilds";
import db from "./database/connection"
import fetch from "node-fetch";
import color from "./console" 
import Register from "./controllers/Register"

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

const handleDeleteMembers = async () => {

  for (const i in guildId) {

    const registrados = await db("members")
      .where("guildName" , "=", guildId[i].prefixo)

    
    const response = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/guilds/${guildId[i].token}/members`)
    const data = await response.json()
    
    console.log(color.cyan,`Requisitando a guild ${guildId[i].prefixo} - COMPLETO`)
    
    registrados.forEach((registrado: MembersDataBase) => {

      let isMemberStillAlliance = false

      data.forEach((membro: ResponseAlbion) => {
        if (registrado.nome == membro.Name.toUpperCase()) {
          isMemberStillAlliance = true
        }  
      })

      if (!isMemberStillAlliance) {
        Register.update(registrado)
      }

    })
  }  
 

}

export default handleDeleteMembers