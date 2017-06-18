const Chromy = require('../src')

async function checkGetWindowForTarget (chromy) {
	try {
		let targets = await chromy.getPageTargets()
		await chromy.client.Browser.getWindowForTarget({targetId: targets[0].targetId})
		console.log('getWindowForTarget(): Implemented')
	} catch (e) {
		console.log('getWindowForTarget(): Not Implemented')
	}
}

async function checkPrintToPdf (chromy) {
  try {
		await chromy.client.Page.printToPDF()
		console.log('printToPdf(): Implemented')
  } catch (e) {
		console.log('printToPdf(): Not Implemented')
  }
}

async function main () {
  console.log('HEADLESS MODE -----')
  let chromy = new Chromy()
	await chromy.start('http://example.com/')
	try {
		await checkGetWindowForTarget(chromy)
		await checkPrintToPdf(chromy)
	} finally {
		await chromy.close()
	}

  console.log('VISIBLE MODE -----')
  chromy = new Chromy({visible: true})
	await chromy.start('http://example.com/')
	try {
		await checkGetWindowForTarget(chromy)
		await checkPrintToPdf(chromy)
	} finally {
		await chromy.close()
	}
}

main().then(() => {
  console.log('finished')
}).catch((e) => {
  console.log(e)
})

