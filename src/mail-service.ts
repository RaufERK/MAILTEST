import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Получаем профиль из аргументов командной строки
const profile = process.argv[2]?.toUpperCase()
if (!profile || !['PRO', 'TECH'].includes(profile)) {
  console.error('Укажите профиль: PRO или TECH')
  console.error('Пример: npm run dev PRO')
  process.exit(1)
}

const {
  MAIL_PASSWORD_TECH,
  MAIL_PASSWORD_PRO,
  TARGET_MAIL,
  SOURCE_MAIL_PRO,
  SOURCE_MAIL_TECH,
  MAIL_SERVER_PRO,
  MAIL_SERVER_TECH,
} = process.env

const SOURCE_MAIL = profile === 'PRO' ? SOURCE_MAIL_PRO : SOURCE_MAIL_TECH
const MAIL_SERVER = profile === 'PRO' ? MAIL_SERVER_PRO : MAIL_SERVER_TECH
const MAIL_PASSWORD = profile === 'PRO' ? MAIL_PASSWORD_PRO : MAIL_PASSWORD_TECH

console.log(`🚀 Запуск профиля: ${profile}`)
console.log(`📧 Email: ${SOURCE_MAIL}`)
console.log(`🌐 Сервер: ${MAIL_SERVER}`)
console.log(`🔒 Порт: ${profile === 'PRO' ? '587 (TLS)' : '465 (SSL)'}`)

// Проверяем обязательные переменные
if (!MAIL_PASSWORD || !TARGET_MAIL || !SOURCE_MAIL || !MAIL_SERVER) {
  console.error(
    'Отсутствуют обязательные переменные окружения для профиля',
    profile
  )
  console.error(
    `Нужны: MAIL_PASSWORD_${profile}, TARGET_MAIL, SOURCE_MAIL_${profile}, MAIL_SERVER_${profile}`
  )
  process.exit(1)
}

const transportConfig =
  profile === 'PRO'
    ? {
        host: MAIL_SERVER,
        port: 587,
        secure: false,
        requireTLS: true,
        tls: {
          rejectUnauthorized: false, // Игнорируем SSL сертификат для PRO
        },
        auth: {
          user: SOURCE_MAIL,
          pass: MAIL_PASSWORD,
        },
        name: 'amasters.pro',
      }
    : {
        host: MAIL_SERVER,
        port: 465,
        secure: true,
        auth: {
          user: SOURCE_MAIL,
          pass: MAIL_PASSWORD,
        },
        name: 'amasters.tech',
      }

const transporter = nodemailer.createTransport(transportConfig)

export async function sendTestMail(): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: SOURCE_MAIL,
      to: TARGET_MAIL,
      subject: `Тест профиля ${profile} через ${MAIL_SERVER}`,
      text: 'Привет! Проверка SMTP/TLS.',
    })
    console.log(`✅ ${profile}: Письмо отправлено!`, info.messageId)
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
