const {StateGraph, MessagesAnnotation} = require('@langchain/langgraph');
const {ChatGoogleGenerativeAI} = require('@langchain/google-genai');
const tools = require('./tools');
const {ToolMessage, AIMessage, HumanMessage} = require('@langchain/core/messages');

const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    apiKey: process.env.GOOGLE_API_KEY
});

const graph = new StateGraph(MessagesAnnotation);

graph.addNode('tools', async (state, config)=>{                    
    const lastmessage = state.messages[state.messages.length -1];
    const toolsCall = lastmessage.tool_calls
    const toolCallResults = await Promise.all(toolsCall.map(async (call)=>{
        const tool = tools[call.name];
        if(!tool){
            return `Tool with name ${call.name} not found`;
        }
        const toolInput = call.args;
        console.log('call name:', call.name, 'call', call);
        const toolResult = await tool.func({...toolInput, token: config.metadata.token}); // here we pass the token from config metadata to the tool 
        return new ToolMessage({name: call.name, content: toolResult});
    }))
    state.messages.push(...toolCallResults);
    return state;
});

graph.addNode('chat', async (state, config)=>{  
    const response = await model.invoke(state.messages, {tools:[tools.searchProduct, tools.addProductToCart]});
    state.messages.push(new AIMessage({content: response.text, tool_calls: response.tool_calls}));
    return state;
});

graph.addEdge('__start__', 'chat');

graph.addConditionalEdges('chat', async (state)=>{
    const lastmessage = state.messages[state.messages.length -1];
    if(lastmessage.tool_calls && lastmessage.tool_calls.length > 0){
        return 'tools';
    }else{
        return '__end__';
    }
});

graph.addEdge('tools', 'chat');

const agent = graph.compile();
module.exports = agent;

// Here is the complete flow of all the code shown above:
// 1. The socket server authenticates the user using JWT tokens and listens for incoming messages.
// 2. When a message is received, it invokes the agent with the user's message and their token.
// 3. The agent processes the message using a state graph that alternates between chatting with the AI model and calling tools as needed. - This is how it is done:
//    - The 'chat' node sends the conversation history to the Google Gemini model, which may respond with tool calls.
//    - If there are tool calls, the state graph transitions to the 'tools' node, which executes the requested tools using the provided token for authentication.
//    - After executing the tools, the state graph returns to the 'chat' node to continue the conversation until no more tool calls are needed.
// 4. The tools interact with external APIs to search for products and add them to the cart, using the provided token for authentication. - This is how it is done:
//    - The `searchProduct` tool makes a GET request to the product search API with the user's query and token.
//    - The `addProductToCart` tool makes a POST request to the cart API to add a specified product and quantity, again using the token for authentication.
// 5. The final response from the agent is sent back to the user via the socket connection.
/// This setup allows for a dynamic and interactive experience where the AI can leverage external services to fulfill user requests.
// / The agent's state graph manages the flow of conversation and tool usage seamlessly.