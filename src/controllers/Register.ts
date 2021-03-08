import db from "../database/connection"

export interface MembersDataBase {
  id: number 
  created_at: string 
  nome: string 
  discordId: string 
  guildName: string 
  guildId: string
}
const update = async (registrado: MembersDataBase) => {
  await db("members")
    .update({status: 0})
    .where("nome" , "=" , registrado.nome.toUpperCase())
    .where("id" , "=" , registrado.id)

}
const remove = async(discordId: string) => {
  
  await db("members")
    .where("discordId", "=", discordId)
    .del()
}
const create = async (nome: string, discordId: string, guildName: string, guildId: string): Promise<boolean> => {
  try {
    if (await isCreated(nome)) return false
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
const isCreated = async (nome: string): Promise<boolean> => {
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

export default {
  create,
  isCreated,
  remove,
  update
}