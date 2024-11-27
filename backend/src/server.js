const { WebSocketServer } = require("ws")
const dotenv = require("dotenv")

dotenv.config()

const wss = new WebSocketServer({ port: process.env.PORT || 8080 })

// Armazena os clientes conectados
let connectedClients = []

wss.on("connection", (ws) => {
    console.log("Cliente conectado");

    // Adiciona o cliente à lista de clientes conectados
    connectedClients.push(ws)

    // Envia a quantidade de usuários online para todos os clientes
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
                type: "userCount",
                count: connectedClients.length
            }))
        }
    })

    // Lida com erros no WebSocket
    ws.on("error", (error) => {
        console.error("Erro WebSocket:", error)
    })

    // Lida com as mensagens enviadas pelos clientes
    ws.on("message", (data) => {
        console.log("Mensagem recebida:", data.toString())

        // Envia a mensagem para todos os clientes conectados
        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(data.toString())
            }
        })
    })

    // Quando um cliente se desconectar, atualizamos a quantidade de usuários online
    ws.on("close", () => {
        connectedClients = connectedClients.filter(client => client !== ws)

        // Envia a nova quantidade de usuários online para todos os clientes
        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                    type: "userCount",
                    count: connectedClients.length
                }))
            }
        })
    })
})
