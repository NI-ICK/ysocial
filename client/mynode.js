const fs = require("fs")
const path = require("path")
const successColor = "\x1b[32m%s\x1b[0m"
const checkSign = "\u{2705}"

const env = process.env.NODE_ENV || "development"
if (env !== "production") require("dotenv").config({ path: "./.env" })

const envFile = `export const environment = {
    GOOGLE_REDIRECT_URL: '${process.env.GOOGLE_REDIRECT_URL}',
    GITHUB_REDIRECT_URL: '${process.env.GITHUB_REDIRECT_URL}',
    GRAPHQL_URL: '${process.env.GRAPHQL_URL}',
    BACKEND_URL: '${process.env.BACKEND_URL}',
};
`
const targetFile =
  env === "production"
    ? "./src/environments/environment.prod.ts"
    : "./src/environments/environment.development.ts"
const targetPath = path.join(__dirname, targetFile)

fs.writeFile(targetPath, envFile, (err) => {
  if (err) {
    console.error(err)
    throw err
  } else {
    console.log(
      successColor,
      `${checkSign} Successfully generated environment variables`
    )
  }
})
