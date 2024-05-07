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
  await page.type('.search-global-typeahead__input', 'education');
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

  await page.waitForSelector("#searchFilter_companyHqGeo");
  const filterButton  = await page.$("#searchFilter_companyHqGeo");
  await filterButton.click();

  const selector = 'input[aria-label="Add a location"]';
  await page.waitForSelector(selector);
  await page.type(selector, "India");

  const locationListId = await page.$eval(selector, value => value.getAttribute("aria-controls"));
  await page.waitForSelector(`#${locationListId}`);
  const locationList = await page.$(`#${locationListId}`);
  const spanElement = await locationList.$("span");
  await spanElement.click();

  let showResultDataControlName = 'button[data-control-name="filter_show_results"]';
  const showResultButton = await page.$(showResultDataControlName);
  await showResultButton.click();


  await page.waitForSelector("#searchFilter_industryCompanyVertical");
  await page.click("#searchFilter_industryCompanyVertical");
  
  const industryDataLabel = 'input[aria-label="Add an industry"]';
  await page.waitForSelector(industryDataLabel);
  await page.type(industryDataLabel, "education");

  const industryListId = await page.$eval(industryDataLabel, value => value.getAttribute("aria-controls"));
  await page.waitForSelector(`#${industryListId}`);
  const industryList = await page.$(`#${industryListId}`);
  const industryElement = await industryList.$("span");
  await industryElement.click();

  const applyFilterButton = await page.waitForSelector('button[data-control-name="filter_show_results"]');
  let Allbuttons =await page.$$('button[data-control-name="filter_show_results"]')
  await Allbuttons[1].click();

  await page.waitForSelector("#searchFilter_companySize");
  const companySizeButton = await page.$("#searchFilter_companySize");
  await companySizeButton.click();

  await page.waitForSelector("#companySize-C");
  const companySize = await page.$("#companySize-C");
  await companySize.click();

  await page.waitForSelector('button[data-control-name="filter_show_results"]');
  Allbuttons =await page.$$('button[data-control-name="filter_show_results"]')
  await Allbuttons[2].click(); 
  
 const nextPageButton =  await page.waitForSelector(".artdeco-button--icon-right");
 let nextPageProperty = await (await nextPageButton.getProperty('disabled')).jsonValue();


  while(!nextPageProperty) { // to iterate on every page;

    await page.waitForSelector(".search-results-container");
    const links = await page.$$(".scale-down");
    for(let  i of links) {
        const link = await (await i.getProperty('href')).jsonValue();
        let newPage = await browser.newPage();
        let n = await (captureData(newPage, link)); // to save data:
        if(n === -1) {
           arrayToSheet(data, "dataFile");
           return await page.close();
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

async function captureData(pg, link) {
    try {
        await pg.goto(link+"about");
        await pg.waitForSelector(".org-page-details-module__card-spacing ");
        const companyDetails = await pg.$(".org-page-details-module__card-spacing ");
        const dl = await companyDetails.$("dl");
        const allDl = await dl.$$("dd");

        const spanWebsite = await allDl[0].$("span");
        const website = await (await spanWebsite.getProperty('textContent')).jsonValue();
        
        const spanPhoneNumber = await allDl[1].$("span");
        const phonenumber = await (await spanPhoneNumber.getProperty('textContent')).jsonValue();
        
        const spanIndustry = await allDl[2].$("span"); let industry;
        if(!spanIndustry) 
          industry = await (await allDl[2].getProperty('textContent')).jsonValue();
        else
            industry = await (await spanIndustry.getProperty('textContent')).jsonValue();
        
        const spanCompanySize = await allDl[3].$("span"); let companySize;
        if(!spanCompanySize)
            companySize = await (await allDl[3].getProperty('textContent')).jsonValue();
        else
            companySize = await (await spanCompanySize.getProperty('textContent')).jsonValue();

        const obj = {
            website: website.trim(),
            phonenumber: phonenumber.trim(),
            industry: industry.trim(),
            companySize: companySize.trim()
        }

        data.push(obj);
        count++;
        console.log(count);
        if(count === 10) return -1;

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