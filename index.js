import puppeteer from 'puppeteer';
import XLSX from 'xlsx';
import dotenv from "dotenv";
dotenv.config();

const data = [];
let count = 0;

(async () => {
  const browser = await puppeteer.launch({headless: false, slowMo: 60});  //browser launch
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await page.goto('https://linkedin.com', {
    args: [
        '--incognito',
      ],
  });
  await page.setViewport({width: 1080, height: 1024});
  
  await page.waitForSelector('#session_key');       
  await page.type('#session_key', process.env.USER_EMAIL);   // userId
  await page.waitForSelector('#session_password');
  await page.type('#session_password', process.env.USER_PASSWORD);     // password

  await page.keyboard.press('Enter');
  await page.waitForNavigation(); // waiting for the nextPage:


  await page.waitForSelector('.search-global-typeahead__input');
  await page.type('.search-global-typeahead__input', 'technology');
  await page.keyboard.press('Enter');

  await page.waitForSelector('.search-reusables__filter-list');
  const searchFilters = await page.$$('.artdeco-pill');

  let index = -1;
  for(let i in searchFilters) {
   const textContent = await page.evaluate(element => element.textContent, searchFilters[i]);
   if(textContent.trim() === 'Companies') {
        index = i;
         break;
    }
  }
  searchFilters[index].click();

  await page.waitForSelector("#searchFilter_companyHqGeo");         //global input
  const filterButton  = await page.$("#searchFilter_companyHqGeo");
  await filterButton.click();

  const selector = 'input[aria-label="Add a location"]';    // location button
  await page.waitForSelector(selector);
  await page.type(selector, "Riyadh");

  const locationListId = await page.$eval(selector, value => value.getAttribute("aria-controls"));
  await page.waitForSelector(`#${locationListId}`);
  const locationList = await page.$(`#${locationListId}`);
  const spanElement = await locationList.$("span");
  await spanElement.click();

  let showResultDataControlName = 'button[aria-label="Apply current filter to show results"]';    // show button
  const showResultButton = await page.$(showResultDataControlName);
  await showResultButton.click();


  await page.waitForSelector("#searchFilter_industryCompanyVertical");  // industry button
  await page.click("#searchFilter_industryCompanyVertical");
  
  const industryDataLabel = 'input[aria-label="Add an industry"]';  // typing in industry input
  await page.waitForSelector(industryDataLabel);
  await page.type(industryDataLabel, "Logistics");

  const industryListId = await page.$eval(industryDataLabel, value => value.getAttribute("aria-controls"));
  await page.waitForSelector(`#${industryListId}`);
  const industryList = await page.$(`#${industryListId}`);
  const industryElement = await industryList.$("span");
  await industryElement.click();  // clicking on industry button

  const applyFilterButton = await page.waitForSelector('button[aria-label="Apply current filter to show results"]');
  let Allbuttons =await page.$$('button[aria-label="Apply current filter to show results"]')
  await Allbuttons[1].click();  // show button

  await page.waitForSelector("#searchFilter_companySize");      // company size button
  const companySizeButton = await page.$("#searchFilter_companySize");
  await companySizeButton.click();

  await page.waitForSelector("#companySize-C");     // selcting company size
  const companySize_1 = await page.$("#companySize-C");
  await companySize_1.click();

  await page.waitForSelector("#companySize-D");     // selcting company size
  const companySize_2 = await page.$("#companySize-D");
  await companySize_2.click();

  await page.waitForSelector("#companySize-E");     // selcting company size
  const companySize_3 = await page.$("#companySize-E");
  await companySize_3.click();

  await page.waitForSelector('button[aria-label="Apply current filter to show results"]');
  Allbuttons =await page.$$('button[aria-label="Apply current filter to show results"]')      // clicking on show button
  await Allbuttons[2].click(); 
  
 const nextPageButton =  await page.waitForSelector(".artdeco-button--icon-right");     // next page button
 let nextPageProperty = await (await nextPageButton.getProperty('disabled')).jsonValue();


  while(!nextPageProperty) { // to iterate on every page;

    await page.waitForSelector(".search-results-container");
    const links = await page.$$(".scale-down");
    for(let  i of links) {
        const link = await (await i.getProperty('href')).jsonValue();
        let newPage = await browser.newPage();
        let n = await (captureData(newPage, link)); // to save data:
        if(n === -1) {  // termination condition
           arrayToSheet(data, "dataFile");
           return;
        }

        await page.waitForSelector(".artdeco-button--icon-right");
        await newPage.close();
    }

    await page.waitForSelector(".artdeco-button--icon-right");
    const nextBtn = await page.$(".artdeco-button--icon-right");
    await nextBtn.click();  
    await page.waitForNavigation();
    nextPageProperty = await (await nextPageButton.getProperty('disabled')).jsonValue();
  }
})();



async function captureData(pg, link) {      // to save the data of each company
    try {
        const pageData = {
            "Name": null,
            "Website": null,
            "Industry": null,
            "Company size": null,
            "Headquarters": null,
            "Phone": null
        }

        await pg.goto(link+"about");
        await pg.waitForSelector(".org-page-details-module__card-spacing ");
        const companyDetails = await pg.$(".org-page-details-module__card-spacing ");

        await pg.waitForSelector('h1')
        let titlepart = await pg.$('h1')
        let titleContent = await pg.evaluate(element => element.textContent, titlepart)
        pageData["Name"] = titleContent.trim();

        await pg.waitForSelector('dl')
        const dl = await pg.$('dl')
        const allDd = await dl.$$('dd')
 
        const headings = await pg.$$('dt')
        const headingsData = await pg.$$('dd');
 
 
        for (let i = 0; i < headings.length; i++) {
            let itemsData = await pg.evaluate(element => element.textContent.trim(), headings[i]);
            // console.log(itemsData);

            if (itemsData.trim() == "Website") {
                let itemsValue = await pg.evaluate(element => element.textContent, headingsData[i])
                pageData[itemsData] = itemsValue.trim();
            } else if (itemsData.trim() == "Industry") {
                let itemsValue = await pg.evaluate(element => element.textContent, headingsData[i])
                pageData[itemsData] = itemsValue.trim();
            } else if (itemsData.trim() == "Company size") {
                let itemsValue = await pg.evaluate(element => element.textContent, headingsData[i])
                pageData[itemsData] = itemsValue.trim();
            } else if(itemsData.trim() === "Headquarters") {
                let itemsValue = await pg.evaluate(element => element.textContent, headingsData[i+1]);
                pageData[itemsData] = itemsValue.trim();
            } else if(itemsData.trim() === "Phone") {
                let itemsValue = await pg.evaluate(element => element.textContent, headingsData[i])
                pageData[itemsData] = itemsValue.trim();
            }
        }

        data.push(pageData);
        count++;
        console.log(count);
        if(count === 50) return -1;

    } catch (error) {
        // console.log(error);   
    }
}

function arrayToSheet(data, filename) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}data.xlsx`);
}



// const ws = XLSX.utils.json_to_sheet(data);
// const wb = XLSX.utils.book_new();
// XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
// XLSX.writeFile(wb, `${country + searchFields + industry}data.xlsx`);