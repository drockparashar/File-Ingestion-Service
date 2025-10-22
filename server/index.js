import http from "http";

const server=http.createServer((req,res)=>{
    const headers={ 'Content-Type': 'text/plain' ,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'}
    res.writeHead(200,headers);

    res.end("Hello world");
});


server.listen(5000,()=>console.log("Server running on PORT: 5000"));