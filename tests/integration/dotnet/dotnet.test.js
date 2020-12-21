import { resolve } from 'path'
import fetch from 'node-fetch'
import { joinUrl, setup, teardown } from '../_testHelpers/index.js'

jest.setTimeout(60000)

// Could not find dotnet framework installed, skipping 'dotnet' tests.
const _describe = process.env.DOTNETCORE31_DETECTED ? describe : describe.skip

_describe('dotnet tests', () => {
  // init
  beforeAll(() =>
    setup({
      servicePath: resolve(__dirname),
    }),
  )

  // cleanup
  afterAll(() => teardown())

  it('should work with dotnet', async () => {
    const test = {
      expected: {
        message: 'Hello, dotnetcore!',
      },
      path: '/dev/hello',
    }
    const url = joinUrl(TEST_BASE_URL, test.path)
    const response = await fetch(url)
    const json = await response.json()
    const data = JSON.parse(json.replace(/\\"/g, '"'))
    expect(data).toEqual(test.expected)
  })

  it('should pass string input to dotnet', async () => {
    const test = {
      expected: 'test input string',
      body: 'test input string',
      path: '/dev/input',
    }

    const url = joinUrl(TEST_BASE_URL, test.path)
    const response = await fetch(url, {
      method: 'post',
      body: test.body,
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await response.json()
    expect(json).toEqual(test.expected)
  })

  it('should pass correct event Type to dotnet', async () => {
    const test = {
      expected: {
        payload: {
          message: 'test this',
        },
        type: 'Amazon.Lambda.APIGatewayEvents.APIGatewayProxyRequest',
        output: 'success!',
      },
      body: {
        message: 'test this',
      },
      path: '/dev/event',
    }
    const url = joinUrl(TEST_BASE_URL, test.path)
    const response = await fetch(url, {
      method: 'post',
      body: JSON.stringify(test.body),
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await response.json()
    const data = JSON.parse(json.replace(/\\"/g, '"'))
    expect(data).toEqual(test.expected)
  })

  it('should pass context to dotnet', async () => {
    const test = {
      expected: {
        functionName: 'dotnet-tests-dev-context',
        invokedFunctionArn:
          'offline_invokedFunctionArn_for_dotnet-tests-dev-context',
        functionVersion: '$LATEST',
        output: 'success!',
      },
      path: '/dev/context',
    }
    const url = joinUrl(TEST_BASE_URL, test.path)
    const response = await fetch(url)
    const json = await response.json()
    const data = JSON.parse(json.replace(/\\"/g, '"'))
    expect(data.context.FunctionName).toEqual(test.expected.functionName)
    expect(data.context.FunctionVersion).toEqual(test.expected.functionVersion)
    expect(data.context.InvokedFunctionArn).toEqual(
      test.expected.invokedFunctionArn,
    )
    /* Example LambdaContext values included from serverless-offline
      context: {
        AwsRequestId: 'ckiyttlet00036rn5bmpl2k2c',
        FunctionName: 'dotnet-tests-dev-context',
        FunctionVersion: '$LATEST',
        InvokedFunctionArn: 'offline_invokedFunctionArn_for_dotnet-tests-dev-context',
        LogGroupName: 'offline_logGroupName_for_dotnet-tests-dev-context',
        LogStreamName: 'offline_logStreamName_for_dotnet-tests-dev-context',
        MemoryLimitInMB: 128,
        RemainingTime: {
          Ticks: 0,
          Days: 0,
          Hours: 0,
          Milliseconds: 0,
          Minutes: 0,
          Seconds: 0,
          TotalDays: 0,
          TotalHours: 0,
          TotalMilliseconds: 0,
          TotalMinutes: 0,
          TotalSeconds: 0
        }
      },
    */
  })
})
