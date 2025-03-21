"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webdriverio_1 = require("webdriverio");
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const papaparse_1 = __importDefault(require("papaparse"));
const readline_1 = __importDefault(require("readline"));
const node_tesseract_ocr_1 = __importDefault(require("node-tesseract-ocr"));
readline_1.default.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let data = [];
const customFormat = winston_1.default.format.printf(({ level, message, timestamp }) => {
    return `${level.toUpperCase()} | ${timestamp} | ${message}`;
});
const logger = winston_1.default.createLogger({
    level: 'info', // Default log level
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), customFormat),
    transports: [
        //  new winston.transports.Console(), // Logs to the console
        new winston_1.default.transports.File({ filename: path_1.default.join(__dirname + '/logs/app.log') }) // Logs to a file
    ],
});
const loggerf = winston_1.default.createLogger({
    level: 'info', // Default log level
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), customFormat),
    transports: [
        //  new winston.transports.Console(), // Logs to the console
        new winston_1.default.transports.File({ filename: path_1.default.join(__dirname + '/logs/app_final.log') }) // Logs to a file
    ],
});
const cap = {
    "platformName": "iOS",
    "appium:wdaBaseUrl": "http://10.0.0.28",
    "appium:wdaLocalPort": 8100,
    "appium:automationName": "XCUITest",
    "appium:udid": "00008110-0001048E2E6B801E"
};
const wdOpts = {
    hostname: 'localhost',
    port: 4723,
    logLevel: "silent",
    capabilities: cap,
    path: '/wd/hub'
};
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(r => setTimeout(r, ms));
    });
}
function Android() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Press "j" for export or "q" for export and exit`);
        const driver = yield (0, webdriverio_1.remote)(wdOpts);
        process.stdin.on("keypress", (str, key) => __awaiter(this, void 0, void 0, function* () {
            if (key.name === "j") {
                const csv = papaparse_1.default.unparse(data);
                console.log(`Exporting... `);
                fs_1.default.writeFileSync("./data.csv", csv, "utf8");
            }
            if (key.name === "q") {
                const csv = papaparse_1.default.unparse(data);
                console.log(`Exporting... `);
                fs_1.default.writeFileSync("./data.csv", csv, "utf8");
                yield driver.deleteSession();
                console.log("Exited");
                process.exit(0);
            }
        }));
        try {
            let ids = new Set();
            logger.info(`Starting`);
            let tr = 1;
            while (true) {
                const elements = yield driver.$$('(//XCUIElementTypeStaticText[1]/XCUIElementTypeStaticText)');
                //@ts-ignore 
                for (let i = 3; i < elements.length - 4; i++) {
                    yield driver.hideKeyboard();
                    const txt = yield elements[i].getText();
                    const elemId = elements[i].elementId; // Store unique element ID
                    if (ids.has(txt)) {
                        logger.info(`Skipping duplicate: ${txt}`);
                        if (tr > 3) {
                            logger.info(`it's done`);
                            process.exit(0);
                        }
                        tr++;
                        continue;
                    }
                    logger.info(`Processing ${i}/${elements.length}: ${txt}`);
                    yield elements[i].click();
                    ids.add(txt);
                    tr = 1;
                    yield sleep(1200);
                    try {
                        const isText = yield driver.$(`//XCUIElementTypeCell[@name]/XCUIElementTypeOther[4]`);
                        //  if(isNext){
                        //     await isNext.click()
                        //     const seq=await driver.$(`((//androidx.appcompat.widget.LinearLayoutCompat[@resource-id="com.infonow.bofa:id/screen_zelle_pay_home_recipient_right_element_text"])//android.widget.TextView)[1]`).getText()
                        //     const num=await driver.$(`((//androidx.appcompat.widget.LinearLayoutCompat[@resource-id="com.infonow.bofa:id/screen_zelle_pay_home_recipient_right_element_text"])//android.widget.TextView)[2]`).getText()
                        //     const name=await driver.$(`((//androidx.appcompat.widget.LinearLayoutCompat[@resource-id="com.infonow.bofa:id/screen_zelle_pay_home_recipient_right_element_text"])//android.widget.TextView)[3]`).getText()
                        //const d= await driver.executeScript("return arguments[0].textContent;", [isText]);//isText.getText()     
                        const pn = yield driver.takeElementScreenshot(isText.elementId);
                        fs_1.default.writeFileSync('./sm.png', pn, 'base64');
                        const dt = yield node_tesseract_ocr_1.default.recognize('./sm.png', { psm: 3, oem: 1, lang: "eng" });
                        let t = dt.split('\n');
                        data.push({ number: t[1], name: t.slice(3, t.length).join(" ").split('as')[1] });
                        //     loggerf.info(`name:${d}--`)
                        //  }
                        if (isText) {
                            yield driver.back();
                        }
                    }
                    catch (e) {
                        let c = e;
                    }
                    yield sleep(1000); // Ensure page refresh
                }
                //  await driver.execute('mobile: swipe', { direction: 'up',percentage: 0.50 });
                //  await driver.execute('mobile: swipe', {
                //     left: 185, // X coordinate (center of screen)
                //     top: 600,  // Start Y (bottom of screen)
                //     width: 0,  // No horizontal movement
                //     height: -300, // Move up by 400 pixels (adjust for scroll distance)
                //     duration: 1000 // Milliseconds (smoother swipe)
                //   });
                yield driver.action('pointer')
                    .move({ duration: 0, x: 177, y: 604 })
                    .down({ button: 0 })
                    .move({ duration: 1000, x: 182, y: 385 })
                    .up({ button: 0 })
                    .perform();
                //  await driver.execute('mobile: touchAndDrag', {
                //     startX: 185, // Start position (adjust as needed)
                //     startY: 600,
                //     endX: 185,   // Keep same X to ensure vertical movement
                //     endY: 385,   // End position (controls scroll amount)
                //     duration: 1000 // Duration in ms (smooth scroll)
                //   });
                //   await driver.execute('mobile: scroll', {
                //     direction: 'up',
                //     percent: 0.5, // 1.0 = full screen scroll, 0.5 = half screen
                //   });
                //     await driver.performActions([
                //      {
                //        type: "pointer",
                //        id: "touch", // Unique identifier
                //        parameters: { pointerType: "touch" }, // Required for touch events
                //        actions: [
                //          { type: "pointerMove", duration: 0, x: 500, y: 800 }, // Move to start
                //          { type: "pointerDown" }, // Touch press
                //          { type: "pause", duration: 500 }, // Short delay
                //          { type: "pointerMove", duration: 1000, x: 500, y:300 }, // Drag/swipe
                //          { type: "pointerUp" }, // Release
                //        ],
                //      },
                //    ]);
            }
        }
        catch (e) {
        }
        finally {
            yield driver.deleteSession();
        }
    });
}
Android();
