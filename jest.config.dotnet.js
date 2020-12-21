'use strict'

const { AWS_ENDPOINT } = process.env

module.exports = {
  bail: true,
  globals: {
    RUN_TEST_AGAINST_AWS: AWS_ENDPOINT != null,
    TEST_BASE_URL: AWS_ENDPOINT || 'http://localhost:3000',
  },
  roots: ['tests/integration/dotnet'],
  setupFiles: ['object.fromentries/auto.js'],
  ...(!process.env.SKIP_SETUP && {
    globalSetup: './tests/_setupTeardown/npmInstall.js',
  }),
}
