import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const { MAIL_PASSWORD, TARGET_MAIL, SOURCE_MAIL, MAIL_SERVER } = process.env

console.log('🚀 Запуск mail service')
console.log(`📧 Email: ${SOURCE_MAIL}`)
console.log(`🌐 Сервер: ${MAIL_SERVER}`)
console.log('🔒 Порт: 587 (TLS + servername fix)')
console.log('❌ SSL сертификат НЕ заменён - всё ещё для *.hosting.reg.ru')
console.log('🔧 Используем servername fix до замены сертификата')

if (!MAIL_PASSWORD || !TARGET_MAIL || !SOURCE_MAIL || !MAIL_SERVER) {
  console.error('Отсутствуют обязательные переменные окружения')
  console.error('Нужны: MAIL_PASSWORD, TARGET_MAIL, SOURCE_MAIL, MAIL_SERVER')
  process.exit(1)
}

const transportConfig = {
  host: MAIL_SERVER,
  port: 587,
  secure: false,
  requireTLS: true,
  tls: {
    servername: 'sm30.hosting.reg.ru',
  },
  auth: {
    user: SOURCE_MAIL,
    pass: MAIL_PASSWORD,
  },
  name: 'amasters.pro',
}

const transporter = nodemailer.createTransport(transportConfig)

export async function sendTestMail(): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: SOURCE_MAIL,
      to: TARGET_MAIL,
      subject: `Тест SMTP через ${MAIL_SERVER}`,
      text: 'Привет! Проверка SMTP/TLS.',
    })
    console.log('✅ Письмо отправлено!', info.messageId)
    console.log(`📤 От: ${SOURCE_MAIL}`)
    console.log(`📥 Кому: ${TARGET_MAIL}`)
    console.log(`📡 Сервер: ${MAIL_SERVER}`)
  } catch (error) {
    console.error('Ошибка отправки:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  sendTestMail()
}
