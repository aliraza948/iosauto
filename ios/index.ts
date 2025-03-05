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
}
const RandomMax = (max: number): number => {
    return Math.ceil(Math.random() * max)
}
async function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms))
}
async function runTest() {
    const driver = await remote(wdOpts) as Browser
    process.stdin.on("keypress", (str, key) => {
        if (key.name === "j") {
            console.log("\n'Q' key pressed. Exiting...");
            const csv = paparse.unparse(data)
            fs.writeFileSync("./data.csv", csv, "utf8");
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
                const pic = await driver.takeElementScreenshot(el.elementId)
                const name = await driver.$('(//XCUIElementTypeScrollView/XCUIElementTypeOther[1]/XCUIElementTypeOther//XCUIElementTypeStaticText)[1]').getText()
                logger.info(`before ${name}--number ${ny}`)
                const r = /^[A-Za-z]{2}/
                while (true) {
                    if (r.test(name.trim())) {
                        const dt = await axios.post('http://localhost:3000/bucket', { type: "insert", id: ny, name, image: pic }, {
                            validateStatus(status) {
                                return true
                            }, timeout: 30000
                        })
                        if (dt.status == 200) {
                            break
                        }
                        logger.error(`getting error for push data ${ny}`)

                    }
                    break

                }
                logger.info(`${name}--number ${ny}`)
                ny++
                await elements.clearValue()
                await elements.setValue(ny)

            }
            await sleep(2000)

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