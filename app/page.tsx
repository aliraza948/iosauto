"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";

import Image from "next/image";
import { useEffect, useState } from "react";


import { ScrollArea } from "@/components/ui/scroll-area";

import axios from 'axios';
import { BucketRequest,  PageSize ,BucketResponse} from "./types";

import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function Page() {

 
  

  const [needRefreshBucket, setRefreshBucket] = useState<boolean>(false)
  const [bucket, setbucket] = useState<BucketResponse>()
  const [page, setpage] = useState<PageSize>({ page_number: 1, page_size: 5 })
  const [isloading, setLoading] = useState({ bucket: false, bucketView: false })
  /// for 
 
  useEffect(() => {
    setLoading({ ...isloading, bucket: true })
    
      axios.post('/bucket', { type: "view", page_info: page } as BucketRequest, { validateStatus: () => true }).then(i => {
        if (i.status == 200) {
          const d = i.data as BucketResponse
          setbucket(d)
        }
        setLoading({ ...isloading, bucket: false })
      })
    
  }, [ page, needRefreshBucket])
  
  
 
  return (
    <>
      <div className="flex flex-col w-full" suppressHydrationWarning>
        <div >
        
        </div>
        
        <div className="flex w-full justify-center mt-28">
        <Card>
                <CardHeader>
                  <CardTitle>Bucket</CardTitle>
                  <CardDescription>
                    Your Added Queue are here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    {isloading.bucket && Array(10).fill(0).map(i => (<>
                      <div className="flex space-y-7 py-2"><Skeleton className=" w-full h-5" /></div>
                    </>))}
                    {!isloading.bucket && (<>
                    <Table>
                      <TableCaption></TableCaption>
                      <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">#id</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Image</TableHead>
                            
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {bucket?.data.map((y, invoice) => (
                          <TableRow key={BigInt(y.id)}>
                            <TableCell className="font-medium">{BigInt(y.id)}</TableCell>
                            <TableCell>{y.name}</TableCell>
                            <TableCell><img src={`data:image/png;base64,${y.image}`} width={50} height={50} /></TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>


                        </TableRow>
                      </TableFooter>
                    </Table></>)}
                  </ScrollArea>

                </CardContent>
                <CardFooter>
                  <div className="flex w-full space-x-3">
                    <Button disabled={page.page_number <= 1} onClick={()=>{let p=page.page_number;p-=1;setpage({...page,page_number:p})}}>Privious</Button>
                    <Button disabled={(parseInt(bucket?.total / page.page_size) + 1)<=page.page_number} onClick={()=>{let p=page.page_number;p+=1;setpage({...page,page_number:p})}}>Next</Button>
                    <Select onValueChange={(e)=>{setpage({...page,page_size:parseInt(e)})}} defaultValue={page.page_size.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Page Size"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel></SelectLabel>
                           {Array(200).fill(0).map((b,y)=>(<><SelectItem value={y.toString()}>{y}</SelectItem></>))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center w-full justify-end">Page: {page.page_number}/{parseInt(bucket?.total / page.page_size) + 1}</div>

                  </div>

                </CardFooter>
              </Card>
        </div>
      </div>
    </>
  );
}
