import {askGroq} from "../lib/groqClient.js"

export async function plan(files,instruction){

const prompt=`
Repository files:

${files.join("\n")}

Task:
${instruction}

Return JSON list of files to modify.
`

const res = await askGroq([
{role:"system",content:"You are a coding planner."},
{role:"user",content:prompt}
])

return JSON.parse(res)

}
