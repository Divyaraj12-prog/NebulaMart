const {Server} = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const agent = require('../agents/agent');

async function initSocketServer(httpServer){
   
    const io = new Server(httpServer, {});

    io.use((socket, next)=>{
        const cookies = socket.handshake.headers?.cookie;

        const {token} = cookies ? cookie.parse(cookies) : {};

        if(!token){
            return next(new Error('Token not found'));
        }

        try{
         const decode = jwt.verify(token, process.env.JWT_SECRET);
         socket.user = decode;
         socket.token = token;
         next();
        }catch(err){
           return next(new Error('Invalid Token'));
        }
    })

    io.on('connection', (socket)=>{
        console.log(socket.user);
        console.log(socket.token);

        console.log('a user connected');

        socket.on('message', async (data)=>{
            console.log('message received:', data);
            const agentResponse = await agent.invoke({
                messages: [
                    {
                        role: "user",
                        content: data
                    }
                ]
            },{ metadata: {token: socket.token } });

            const lastmessage = agentResponse.messages[agentResponse.messages.length -1];
            socket.emit('message', lastmessage.content);
        });
    })
}


module.exports = {initSocketServer}