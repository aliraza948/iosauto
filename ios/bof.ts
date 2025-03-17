import {remote} from "webdriverio"
import winston from 'winston'
import path from 'path'
import fs from "fs"
import paparse from 'papaparse'
import readline from 'readline'
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let data:{
    seq?:string,
    number?:string,
    name:string
}[]=[]


const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${level.toUpperCase()} | ${timestamp} | ${message}`;
});
const logger = winston.createLogger({
    level: 'info', // Default log level
    format: winston.format.combine(
        winston.format.timestamp(),
        customFormat
    ),
    transports: [
        //  new winston.transports.Console(), // Logs to the console
        new winston.transports.File({ filename: path.join(__dirname+'/logs/app.log') }) // Logs to a file
    ],
});

const loggerf = winston.createLogger({
    level: 'info', // Default log level
    format: winston.format.combine(
        winston.format.timestamp(),
        customFormat
    ),
    transports: [
        //  new winston.transports.Console(), // Logs to the console
        new winston.transports.File({ filename: path.join(__dirname+'/logs/app_final.log') }) // Logs to a file
    ],
});
const cap={
   "platformName": "iOS",
    "appium:wdaBaseUrl": "http://10.0.0.77",
    "appium:wdaLocalPort": 8100,
    "appium:automationName": "XCUITest",
    "appium:udid": "00008110-0001048E2E6B801E"
}
const wdOpts={
    hostname:'localhost',
    port:4723,
    logLevel:"silent",
    capabilities:cap,
    path:'/wd/hub'
} as WebdriverIO.RemoteConfig
async function sleep(ms:number) {
    return new Promise(r=>setTimeout(r,ms))
}
async function Android() {
   
    const driver=await remote(wdOpts)
    process.stdin.on("keypress",async (str, key) => {
        if(key.name==="q"){
            const csv=paparse.unparse(data)
            fs.writeFileSync("./data.csv", csv, "utf8");
            await driver.deleteSession()
            console.log("Exit");
            process.exit(0)
        }
        if (key.name === "j") {
          console.log("Exporting..");
          const csv=paparse.unparse(data)
          fs.writeFileSync("./data.csv", csv, "utf8");
          console.log("Export done");
          
        }
      });
    try{
        let ids=new Set()
        logger.info(`Starting`)
        let tr=1
        while (true){
       const elements=await  driver.$$('//XCUIElementTypeOther[contains(@name,"Zelle:Recipients")]')
        
        //@ts-ignore 
        for (let i = 4; i < elements.length - 2; i++) {
            await driver.hideKeyboard()
        //  const txt = await elements[i].$('(//android.widget.TextView)[2]').getText();
        //  const elemId = elements[i].elementId; // Store unique element ID
 
        //  if (ids.has(txt)) {
        //      logger.info(`Skipping duplicate: ${txt}`);
        //      if(tr>3){
        //          logger.info(`it's done`)
        //          process.exit(0)
                 
        //      }
        //      tr++
        //      continue;
        //  }
 
         logger.info(`Processing ${i}/${elements.length}: `);
 
         await elements[i].click();
        // ids.add(txt)
        
         tr=1
         await sleep(1200);
     try{    const isText=await driver.$(`//XCUIElementTypeCell[@name]/XCUIElementTypeOther[4]`)
        //  if(isNext){
        //     await isNext.click()
        //     const seq=await driver.$(`((//androidx.appcompat.widget.LinearLayoutCompat[@resource-id="com.infonow.bofa:id/screen_zelle_pay_home_recipient_right_element_text"])//android.widget.TextView)[1]`).getText()
        //     const num=await driver.$(`((//androidx.appcompat.widget.LinearLayoutCompat[@resource-id="com.infonow.bofa:id/screen_zelle_pay_home_recipient_right_element_text"])//android.widget.TextView)[2]`).getText()
        //     const name=await driver.$(`((//androidx.appcompat.widget.LinearLayoutCompat[@resource-id="com.infonow.bofa:id/screen_zelle_pay_home_recipient_right_element_text"])//android.widget.TextView)[3]`).getText()
        const d=await isText.getText()     
        data.push({name:d})
             loggerf.info(`name:${d}-- `)
        //  }
        }catch(e){}
    
         await driver.back()
         await sleep(1000); // Ensure page refresh
     }
        await driver.performActions([
         {
           type: "pointer",
           id: "touch", // Unique identifier
           parameters: { pointerType: "touch" }, // Required for touch events
           actions: [
             { type: "pointerMove", duration: 0, x: 500, y: 800 }, // Move to start
             { type: "pointerDown" }, // Touch press
             { type: "pause", duration: 500 }, // Short delay
             { type: "pointerMove", duration: 1000, x: 500, y:300 }, // Drag/swipe
             { type: "pointerUp" }, // Release
           ],
         },
       ]);
       
    }}catch(e){
        
    }finally{
        await driver.deleteSession()
    }
    
}
Android()