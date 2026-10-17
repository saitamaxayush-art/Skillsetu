import { Router } from 'express'

export const ttsRouter = Router()

// Split text into chunks that Google TTS can safely accept (< 180 chars)
function splitTextIntoChunks(text: string, maxLen = 160): string[] {
  // Normalize whitespace
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  if (clean.length <= maxLen) return [clean]

  const sentences = clean.split(/([।!?\n]+)/).reduce<string[]>((acc, cur, idx) => {
    if (idx % 2 === 0) {
      if (cur.trim()) acc.push(cur.trim())
    } else if (acc.length) {
      acc[acc.length - 1] += cur
    }
    return acc
  }, [])

  const chunks: string[] = []
  for (const sentence of sentences) {
    if (sentence.length <= maxLen) {
      chunks.push(sentence)
    } else {
      const words = sentence.split(' ')
      let current = ''
      for (const word of words) {
        if ((current + ' ' + word).trim().length <= maxLen) {
          current = (current + ' ' + word).trim()
        } else {
          if (current) chunks.push(current)
          current = word
        }
      }
      if (current) chunks.push(current)
    }
  }

  return chunks.length ? chunks : [clean.slice(0, maxLen)]
}

ttsRouter.get('/', async (req, res) => {
  try {
    const text = String(req.query.text || '').trim()
    const lang = req.query.lang === 'en' ? 'en' : 'hi'

    if (!text) {
      res.status(400).json({ error: 'Text query parameter is required' })
      return
    }

    const chunks = splitTextIntoChunks(text, 160)
    if (!chunks.length) {
      res.status(400).json({ error: 'No valid text to speak' })
      return
    }

    // Limit max chunks to 12 to prevent abuse
    const safeChunks = chunks.slice(0, 12)

    const buffers: Buffer[] = []
    for (const chunk of safeChunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunk)}`
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'audio/mpeg, audio/*;q=0.9',
        },
      })

      if (!response.ok) {
        console.warn(`[TTS] Google TTS error for chunk: ${response.status} ${response.statusText}`)
        continue
      }

      const arrayBuf = await response.arrayBuffer()
      if (arrayBuf.byteLength > 0) {
        buffers.push(Buffer.from(arrayBuf))
      }
    }

    if (!buffers.length) {
      res.status(502).json({ error: 'Failed to generate speech audio stream' })
      return
    }

    const combined = Buffer.concat(buffers)

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', combined.length)
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable')
    res.setHeader('Accept-Ranges', 'bytes')

    res.status(200).send(combined)
  } catch (err: any) {
    console.error('[TTS Error]:', err?.message || err)
    res.status(500).json({ error: 'Internal TTS error', message: err?.message || 'Unknown' })
  }
})
