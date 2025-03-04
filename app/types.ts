import { Contacts } from "@prisma/client"

export type BucketResponse={
    total:number
    data:Contacts[]
}
export type BucketRequest={
    type:"delete"
    id:number
}
|
{
    type:"view"
    page_info:PageSize
}|{
    type:"insert"
    name:string
    image:Uint8Array<ArrayBufferLike>
    id:number
}
export interface PageSize{
    page_size:number
    page_number:number
}