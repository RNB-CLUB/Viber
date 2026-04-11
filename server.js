import { createServer } from "http"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { readFileSync } from "fs"
import { Server } from "socket.io"
import db, { init as initDB, getMessages, addMessages } from "./db.js"

initDB()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = createServer(async (req, res) => {
    switch (req.url) {
        case "/":
            let indexHtmlFile = getStaticFile("index.html")
            res.writeHead(200, { "content-type": "text/html" })
            res.end(indexHtmlFile)
            break
        case "/register":
            if (req.method == "GET") {
                let registerHtmlFile = getStaticFile("register.html")
                res.writeHead(200, { "content-type": "text/html" })
                res.end(registerHtmlFile)
            } else if (req.method == "POST") {
                let data = ""
                req.on("data", (chunk) => data += chunk)
                req.on("end", () => {
                    console.log(data)
                    res.end()
                })
            }
            break

        case "/style.css":
            let styleCssFile = getStaticFile("style.css")
            res.writeHead(200, { "content-type": "text/css" })
            res.end(styleCssFile)
            break
        case "/script.js":
            let scriptJsFile = getStaticFile("script.js")
            res.writeHead(200, { "content-type": "text/javascript" })
            res.end(scriptJsFile)
            break
        case "/messages":
            let messages = await getMessages()
            res.writeHead(200, "content-type", "application/json")
            res.end(JSON.stringify(messages))
            break
        default:
            res.statusCode = 404
            res.end("Error: Not Found")
    }
})

const io = new Server(server)

io.on("connection", (socket) => {
    console.log(`User connected with id: ${socket.id}`)
    let nickname = "anonymous"

    socket.on("new_nickname", (data) => {
        nickname = data
    })

    socket.on("new_message", async (data) => {
        console.log(data)
        io.emit("message", {
            user: nickname,
            message: data
        })
        await addMessages(1, data)
    })
})

server.listen(3000, () => console.log("Server On"))

function getStaticFile(name) {
    let pathToFile = path.join(__dirname, "static", name)
    let bufferFile = readFileSync(pathToFile)
    let data = Buffer.from(bufferFile)
    return data
}