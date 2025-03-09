import { Browser, remote } from "webdriverio"

import winston from 'winston'
import path from 'path'
import fs from "fs"
import paparse from 'papaparse'
import readline from 'readline'
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let data: {
    seq: string,
    number: string,
    name: string
}[] = []



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
        new winston.transports.File({ filename: path.join(__dirname + '/logs/app.log') }) // Logs to a file
    ],
});
import axios from "axios"
const capabilities = {
    "platformName": "iOS",
    "appium:wdaBaseUrl": "http://10.0.0.27",
    "appium:wdaLocalPort": 8100,
    "appium:automationName": "XCUITest",
    "appium:udid": "00008020-0015744C2608003A"
};
const wdOpts = {
    hostname: 'localhost',
    port: 4723,
    logLevel: "error",
    capabilities,
    path: '/wd/hub',
} as WebdriverIO.RemoteConfig
const RandomMax = (max: number): number => {
    return Math.ceil(Math.random() * max)
}
async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms))
}
async function runTest() {
    const driver = await remote(wdOpts) as Browser
    console.log(`Press 'Q' for Exit`);
    process.stdin.on("keypress", (str, key) => {
        if (key.name === "q") {
            console.log(`It's exiting...`)
            const csv = paparse.unparse(data)
            process.exit(0)

        }
    });

    try {
        let ids = new Set()
        logger.info(`Starting`)
        let tr = 1
        let ny
        while (true) {

            const elements = await driver.$('//XCUIElementTypeTextField[@name="Name, $Cashtag, Phone, Email"]')

            const text = await elements.getText()
            if (text) {
                ny = Number(text)
                const el = await driver.$('(//XCUIElementTypeScrollView/XCUIElementTypeOther[1]/XCUIElementTypeOther//XCUIElementTypeButton)[1]')
                const pic = await driver.takeElementScreenshot((await el.elementId))
                const name = await driver.$('(//XCUIElementTypeSwitch[@name]/XCUIElementTypeStaticText[@label])[1]').getText()
                const r = /^[A-Za-z]{2}/
                logger.info(`${name}--number ${ny}`)
                    if (r.test(name.trim())) {
                        try{
                        const dt = await axios.post('http://10.0.0.177:3000/bucket', { type: "insert", id: ny, name, image: pic }, )
                        if(dt.status!=200){
                            logger.error(`getting error for push data ${ny}`)
                        }
                    }catch(e){
                        logger.error(`getting error for push data ${ny}`)

                    }
                       }
                ny++
                await elements.clearValue()
                await elements.setValue(ny)

            }
            await sleep(10000)

            tr++
        }
        //    const el=await driver.$('//androidx.recyclerview.widget.RecyclerView[@resource-id="com.android.settings:id/recycler_view"]')
        //    await driver.action("pointer",{})
        //    const scn=await el.takeScreenshot()
        //    fs.writeFileSync("./element.png",scn,"base64")



    } finally {
        await driver.deleteSession();
    }
}

runTest()