import {askGroq} from "../lib/groqClient.js"

export async function modify(content,instruction){

const prompt=`
File content:

${content}

Instruction:
${instruction}

Return updated file only.
`

return await askGroq([
{role:"system",content:"You are a senior software engineer."},
{role:"user",content:prompt}
])

}
