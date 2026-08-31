const sendEmail = require('../utils/mailer')

describe('mailer configuration', () => {
  test('disables TLS certificate rejection in local development', () => {
    const options = sendEmail.getTransportOptions()

    expect(options.tls).toMatchObject({ rejectUnauthorized: false })
  })
})
