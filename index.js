require('dotenv').config()
const puppeteer = require('puppeteer')

const ZAIM_EMAIL    = process.env.ZAIM_EMAIL
const ZAIM_PASSWORD = process.env.ZAIM_PASSWORD
const YEAR          = process.env.YEAR

async function login(page) {
  await page.goto('https://auth.zaim.net/')
  await page.type('input[name="data[User][email]"]', ZAIM_EMAIL)
  await page.type('input[name="data[User][password]"]', ZAIM_PASSWORD)
  await page.click('.submit')
  await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"})
}

async function getCategoryNames(page) {
  await page.goto('https://zaim.net/payment/categories')

  const categoryNames = await page.$$eval('#categories tbody tr:not(.sort_fixed)', trList => {
    return Array.from(trList).map(tr => {
      return tr.children[0].childNodes[2].textContent.trim()
    })
  })

  return categoryNames.sort()
}

async function getMonthlySummaryData(page, categoryNames) {
  // initialize
  const monthlySummaryData = {}
  categoryNames.forEach(categoryName => {
    monthlySummaryData[categoryName] = Array(12).fill(0)
  })

  for (let month = 0; month < 12; month++) {
    const monthParam = `${YEAR}${String(month + 1).padStart(2, '0')}`
    console.log(`${monthParam} Fetching...`)

    await page.goto(`https://zaim.net/summary/weekly_summary?month=${monthParam}`)

    const summaryData = await page.$$eval('#weekly-summary-table tbody tr:not(:first-child)', trList => {
      const data = {} // { `categoryName`: sumValue }
      const categoryLineTdSize = trList[0].children.length
      let categoryName = ''

      Array.from(trList).forEach(tr => {

        // category head line
        if (categoryLineTdSize === tr.children.length) {
          categoryName = tr.children[0].textContent.trim()
        }
        // category sum line
        else if ('小計' === tr.children[0].textContent.trim()) {
          const sumValueWithCurrencySymbol = tr.children[categoryLineTdSize - 3] // カテゴリ名, 合計, 前月比
          data[categoryName] = Number(sumValueWithCurrencySymbol.textContent.replace(/[¥,]/g, '').trim())
          categoryName = ''
        } else {
          // nothing
        }
      })

      return data
    })

    Object.keys(summaryData).map(categoryName => {
      const sum = summaryData[categoryName]
      monthlySummaryData[categoryName][month] = sum
    })
  }

  return monthlySummaryData
}

// main
(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await login(page)

  const categoryNames = await getCategoryNames(page)

  const monthlySummaryData = await getMonthlySummaryData(page, categoryNames)

  await browser.close()

  console.log(monthlySummaryData)
  return monthlySummaryData
})()
