const puppeteer = require('puppeteer');
const fs = require('fs');
const cFile = process.argv[2];
// Grobally declare
let uname, pass;
let FBpage, count;

(async () => {
    try {
        // launch browser 
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized", "--disable-notifications"]
        });
        // set the initially page or main page.
        const pages = await browser.pages();
        let page = pages[0];

        await OpenloginPage(page);
        await OpenPageLinks(page);
        await OpenPageLikes(page);


    } catch (err) {
        console.log(err)
    }
})()

async function OpenloginPage(page) {
    try {

        let contents = await fs.promises.readFile(cFile);
        let credentials = JSON.parse(contents)
        uname = credentials.email;
        pass = credentials.password;
        url = credentials.url;
        FBpage = credentials.page
        count = credentials.count

        await page.goto(url, {
            waitUntil: "networkidle2"
        });
        await page.waitForSelector('#email', {
            visible: true
        });
        await page.type('#email', uname, {
            delay: 120
        })
        await page.type('#pass', pass, {
            delay: 120
        })
        //loginbutton
        await Promise.all([page.waitForNavigation({
                waitUntil: "networkidle2"
            }),
            page.click("#loginbutton")
        ])
        console.log("Login-Completed.")


    } catch (err) {
        console.log(err);
    }
}
async function OpenPageLinks(page) {
    try {

        await page.waitForSelector('input._1frb', {
            visible: true
        })
        await page.type('input._1frb', FBpage, {
            delay: 120
        })
        await page.keyboard.press('Enter')
        await page.waitForSelector('div._77we a', {
            visible: true
        })
        await page.evaluate(() => {
            document.querySelector('div._77we a').click()
        })
        await page.waitForSelector('div[data-key=tab_posts]', {
            visible: true
        })
        await page.evaluate(() => {
            document.querySelector('div[data-key=tab_posts] a._2yau').click()
        })
        await page.waitForNavigation({
            waitUntil: 'networkidle2'
        })
        console.log("Post-Page-open-Completed.")
    } catch (err) {
        console.log(err)
    }
}

async function OpenPageLikes(page) {
    try {

        let idx = 0;
        do {

            await page.waitForSelector("#pagelet_timeline_main_column ._1xnd .clearfix.uiMorePager");
            let elements = await page.$$("#pagelet_timeline_main_column ._1xnd > ._4-u2._4-u8")
            let post = elements[idx];
            let like = await post.$("._666k ._8c74");
            await like.click({
                delay: 100
            });
            idx++;
            await page.waitForSelector(".uiMorePagerLoader", {
                hidden: true
            })
        } while (idx < count)

        console.log("All Completed")

    } catch (err) {
        console.log(err);
    }
}