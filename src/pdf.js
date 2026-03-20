let pdfJsReady = null

function loadPdfJs() {
  if (pdfJsReady) return pdfJsReady
  pdfJsReady = new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/pdfjs-dist@3.11.174/legacy/build/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = ''
      resolve(window.pdfjsLib)
    }
    script.onerror = () => reject(new Error('PDF.js failed to load'))
    document.head.appendChild(script)
  })
  return pdfJsReady
}

async function extractPdfText(file) {
  try {
    const lib = await loadPdfJs()
    const buffer = await file.arrayBuffer()
    const pdf = await lib.getDocument({ data: buffer, disableWorker: true, verbosity: 0 }).promise
    const pages = []

    for (let i = 1; i <= Math.min(pdf.numPages, 25); i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const rows = {}
      content.items.forEach((item) => {
        if (!item.str.trim()) return
        const y = Math.round(item.transform[5])
        if (!rows[y]) rows[y] = []
        rows[y].push(item.str)
      })
      const pageText = Object.keys(rows)
        .sort((a, b) => b - a)
        .map((y) => rows[y].join(' '))
        .join('\n')
      pages.push(pageText)
    }

    const text = pages.join('\n').trim()
    return text.length > 50 ? text : null
  } catch (e) {
    console.warn('PDF extract error:', e.message)
    return null
  }
}

export async function readFileAsText(file) {
  if (!file) return null

  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractPdfText(file)
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      let text = e.target.result || ''
      if (name.endsWith('.docx') || name.endsWith('.doc')) {
        text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        resolve(text.length > 80 ? text : null)
      } else {
        resolve(text || null)
      }
    }
    reader.onerror = () => resolve(null)
    reader.readAsText(file)
  })
}
