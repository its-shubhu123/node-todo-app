import express from 'express'
import path from 'path'
const app=express();
import { MongoClient, ObjectId } from 'mongodb';

const publicPath=path.resolve('public')
app.use(express.static(publicPath))
app.use(express.urlencoded({extended:true}))


const dbName="node-project";
const collectionName="todo"
const url="mongodb://localhost:27017"
const client=new MongoClient(url)

const connection=async ()=>{
    const connect=await  client.connect()
    return await connect.db(dbName);
}

app.set("view engine",'ejs')


app.get('/list',async (req,resp)=>{
    const db=await connection()
    const collection=db.collection(collectionName)
    const result=await collection.find().toArray()
    resp.render("list",{result})
})

app.get("/update",(req,resp)=>{
    resp.render('update')
})

app.get("/add",(req,resp)=>{
    resp.render("add")
})

app.post("/update",(req,resp)=>{
    resp.redirect("/list")
})

app.post("/add",async (req,resp)=>{
    const db=await connection();
    const collection=db.collection(collectionName)
    const result=await collection.insertOne(req.body)
    if(result){
     resp.redirect("/list")
    }
    else{
        resp.redirect('/add')
    }
})

app.get("/delete/:id",async (req,resp)=>{
    const db=await connection();
    const collection=db.collection(collectionName)
    const result=await collection.deleteOne({_id:new ObjectId(req.params.id)})
    if(result){
     resp.redirect("/list")
    }
    else{
        resp.send("some error")
    }
})


app.get("/update/:id",async (req,resp)=>{
    const db=await connection();
    const collection=db.collection(collectionName)
    const result=await collection.findOne({_id:new ObjectId(req.params.id)})
    if(result){
     resp.render("update",{result})
    }
    else{
        resp.send("some error")
    }
})


app.post("/update/:id",async (req,resp)=>{
    const db=await connection();
    const collection=db.collection(collectionName)
    const filter={_id:new ObjectId(req.params.id)}
    
    const updateData={$set:{title:req.body.title,discription:req.body.discription}}
    const result=await collection.updateOne(filter,updateData)
    if(result){
     resp.redirect('/list')
    }
    else{
        resp.send("some error")
    }
})

app.post("/multi-delete",async (req,resp)=>{
    const db=await connection();
    const collection=db.collection(collectionName)
    let selectedTask=undefined
    if(Array.isArray(req.body.selectedTask)){
     selectedTask=req.body.selectedTask.map((id)=>new ObjectId(id))
    }
    else{
         selectedTask=[new ObjectId(req.body.selectedTask)]
    }
    
    const result=await collection.deleteMany({_id:{$in:selectedTask}})
    if(result){
     resp.redirect('/list')
    }
    else{
        resp.send("some error")
    }
})

app.listen(3200)

