import { MessageEmbed } from "discord.js"

interface Embed {
  title: string
  color: number
  description?: string
}
const Embed = ({title, color, description} : Embed) => {
  if (!description) return new MessageEmbed()
    .setTitle(title)
    .setColor(color)
  else return new MessageEmbed()
    .setTitle(title)
    .setColor(color)
    .setDescription(description)
}

export default Embed