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
const papaparse_1 = __importDefault(require("papaparse"));
const readline_1 = __importDefault(require("readline"));
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
const axios_1 = __importDefault(require("axios"));
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
};
const RandomMax = (max) => {
    return Math.ceil(Math.random() * max);
};
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(r => setTimeout(r, ms));
    });
}
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        const driver = yield (0, webdriverio_1.remote)(wdOpts);
        console.log(`Press 'Q' for Exit`);
        process.stdin.on("keypress", (str, key) => {
            if (key.name === "q") {
                console.log(`It's exiting...`);
                const csv = papaparse_1.default.unparse(data);
                process.exit(0);
            }
        });
        try {
            let ids = new Set();
            logger.info(`Starting`);
            let tr = 1;
            let ny;
            while (true) {
                const elements = yield driver.$('//XCUIElementTypeTextField[@name="Name, $Cashtag, Phone, Email"]');
                const text = yield elements.getText();
                if (text) {
                    ny = Number(text);
                    const el = yield driver.$('(//XCUIElementTypeScrollView/XCUIElementTypeOther[1]/XCUIElementTypeOther//XCUIElementTypeButton)[1]');
                    const pic = yield driver.takeElementScreenshot((yield el.elementId));
                    const name = yield driver.$('(//XCUIElementTypeSwitch[@name]/XCUIElementTypeStaticText[@label])[1]').getText();
                    const r = /^[A-Za-z]{2}/;
                    logger.info(`${name}--number ${ny}`);
                    if (r.test(name.trim())) {
                        try {
                            const dt = yield axios_1.default.post('http://10.0.0.177:3000/bucket', { type: "insert", id: ny, name, image: pic });
                            if (dt.status != 200) {
                                logger.error(`getting error for push data ${ny}`);
                            }
                        }
                        catch (e) {
                            logger.error(`getting error for push data ${ny}`);
                        }
                    }
                    ny++;
                    yield elements.clearValue();
                    for (const xy of ny.toString().split("")) {
                        yield elements.sendKeys([xy]);
                        yield sleep(300);
                    }
                }
                yield sleep(10000);
                tr++;
            }
            //    const el=await driver.$('//androidx.recyclerview.widget.RecyclerView[@resource-id="com.android.settings:id/recycler_view"]')
            //    await driver.action("pointer",{})
            //    const scn=await el.takeScreenshot()
            //    fs.writeFileSync("./element.png",scn,"base64")
        }
        finally {
            yield driver.deleteSession();
        }
    });
}
runTest();
