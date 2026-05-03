export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const params = new URLSearchParams()
  params.append('api_key', config.public.apiKey || '')
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })

  try {
    const response = await $fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    if (response?.monitors) {
      response.monitors = response.monitors.map((m: any) => {
        const { url, ...rest } = m
        return rest
      })
    }
    return response
  } catch (err: any) {
    const status = err.status || err.statusCode || 500

    if (status === 429) {
      setResponseStatus(event, 429)
      return {
        stat: 'fail',
        message: '已达到免费版API请求速率限制（10次/分钟），请稍后再试'
      }
    }

    setResponseStatus(event, 502)
    return {
      stat: 'fail',
      message: err.message || 'UptimeRobot API 请求失败'
    }
  }
})
