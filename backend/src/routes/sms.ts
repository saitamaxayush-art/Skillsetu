import { Router } from 'express'
import { db } from '../db/connection.js'

export const smsRouter = Router()

interface SmsSession {
  phone: string
  step: 'INIT' | 'LANG_SELECTED' | 'MATCHES_SENT'
  language: 'mr' | 'hi' | 'en'
}

// POST /api/sms/webhook - Twilio / WhatsApp webhook simulator
smsRouter.post('/webhook', (req, res) => {
  const from = (req.body.From || req.body.from || '+919800041207').trim()
  const body = (req.body.Body || req.body.text || req.body.message || '').trim()

  let session = db.prepare('SELECT phone, step, language FROM sms_sessions WHERE phone = ?').get(from) as
    | SmsSession
    | undefined

  if (!session) {
    db.prepare('INSERT INTO sms_sessions (phone, step, language) VALUES (?, ?, ?)').run(from, 'INIT', 'mr')
    session = { phone: from, step: 'INIT', language: 'mr' }
  }

  let replyText = ''
  const upper = body.toUpperCase()

  if (upper === 'RESET' || upper === 'START' || upper === 'RESTART') {
    db.prepare("UPDATE sms_sessions SET step = 'INIT', updated_at = datetime('now') WHERE phone = ?").run(from)
    replyText = 'ProofPass: Reply 1 Marathi, 2 Hindi, 3 English.'
  } else if (session.step === 'INIT') {
    let chosenLang: 'mr' | 'hi' | 'en' = 'mr'
    if (body === '1' || upper.includes('MARATHI')) chosenLang = 'mr'
    else if (body === '2' || upper.includes('HINDI')) chosenLang = 'hi'
    else if (body === '3' || upper.includes('ENGLISH')) chosenLang = 'en'

    db.prepare("UPDATE sms_sessions SET step = 'LANG_SELECTED', language = ?, updated_at = datetime('now') WHERE phone = ?").run(
      chosenLang,
      from
    )

    if (chosenLang === 'mr') {
      replyText = 'ProofPass: कौशल्ये सापडली (शिलाई, ग्राहक सेवा, पैशांचा हिशोब, बचत गट). नोकऱ्या पाहण्यासाठी YES पाठवा.'
    } else if (chosenLang === 'hi') {
      replyText = 'ProofPass: कौशल मिले (सिलाई, ग्राहक सेवा, हिसाब, बचत गट). नौकरियां देखने के लिए YES भेजें।'
    } else {
      replyText = 'ProofPass: Found skills (Stitching, Customer handling, Cash ledger, Caregiving). Reply YES to see jobs.'
    }
  } else if (session.step === 'LANG_SELECTED' || upper === 'YES' || upper === 'Y' || body === 'हो' || body === 'हाँ') {
    db.prepare("UPDATE sms_sessions SET step = 'MATCHES_SENT', updated_at = datetime('now') WHERE phone = ?").run(from)

    if (session.language === 'mr') {
      replyText = '१) टेलर - मगरपट्टा ₹१६,००० (संध्या. ५ वा. संपेल). २) रिमोट ऑर्डर डेस्क ₹१३,०००. अर्ज करण्यासाठी १ किंवा २ पाठवा.'
    } else if (session.language === 'hi') {
      replyText = '१) टेलर - मगरपट्टा ₹१६,००० (शाम ५ बजे समाप्त). २) रिमोट आर्डर डेस्क ₹१३,०००. आवेदन के लिए १ या २ भेजें।'
    } else {
      replyText = '1) Tailor Magarpatta Rs16000 ends 5pm. 2) Remote order desk Rs13000. Reply number to apply.'
    }
  } else if (session.step === 'MATCHES_SENT') {
    if (body === '1' || body === '2') {
      replyText =
        session.language === 'mr'
          ? `धन्यवाद! नोकरी क्र. ${body} साठी अर्ज पाठवला आहे. कंपनी तुमच्याशी संपर्क साधेल.`
          : session.language === 'hi'
          ? `धन्यवाद! नौकरी सं. ${body} के लिए आवेदन भेजा गया। कंपनी आपसे संपर्क करेगी।`
          : `Application submitted for Job ${body}! Employer will contact you on WhatsApp/SMS.`
    } else {
      replyText = 'ProofPass: Reply 1 or 2 to apply for a job, or RESET to start over.'
    }
  } else {
    replyText = 'ProofPass: Reply 1 Marathi, 2 Hindi, 3 English.'
  }

  // Support Twilio XML response or JSON response
  if (req.headers.accept?.includes('application/json') || req.is('application/json')) {
    return res.json({
      success: true,
      from,
      incoming: body,
      reply: replyText,
      step: session.step,
    })
  }

  res.set('Content-Type', 'text/xml')
  return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyText}</Message></Response>`)
})
