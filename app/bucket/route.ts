'use server'

import { DB } from "@/app/lib/db_setup";
import JSONBig from "json-bigint";
import { BucketRequest, PageSize } from "../types";


export const POST=async (req:Request)=>{
    try{
    
        let body = await req.text();
       body=JSON.parse(body) 
       //@ts-ignore
       const pge=body as BucketRequest
        switch (pge.type){
          case "view":
            const count=await DB.contacts.count()
            const dy=await DB.contacts.findMany({take:pge.page_info.page_size,skip:(pge.page_info.page_number-1)*pge.page_info.page_size,orderBy:{createdAt:"desc"}})
            const jy=dy.map(i=>{const iy=Buffer.from(Object.values(i.image)); return {...i,image:iy.toString("base64"),id:BigInt(i.id)}})
            return new Response(JSONBig.stringify({message:"ok",data:jy,total:count}), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          case "insert":
            const img=Buffer.from(pge.image,"base64")
            await DB.contacts.upsert({where:{id:pge.id},update:{name:pge.name},create:{id:pge.id,name:pge.name,image:img}})
            return new Response(JSON.stringify({message:"ok"}), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })

        }
        
        
      
    }
    catch(e){
      console.log(e)
        return new Response(JSON.stringify({ message: `Error is ${e}` }),{
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
    }
}